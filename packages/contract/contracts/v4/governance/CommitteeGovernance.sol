// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import {ScholarshipTypes}   from "../libraries/ScholarshipTypes.sol";
import {IScholarshipCore}   from "../interfaces/IScholarship.sol";
import {IScholarshipBounty} from "../interfaces/IScholarship.sol";

/**
 * @title  CommitteeGovernance
 * @author Scholarship Protocol
 * @notice Manages per-programme committee members and their two responsibilities:
 *
 * @dev    1. SCREENING SCORES (BY_COMMITTEE mode)
 *            Members read applicant IPFS documents off-chain and submit raw
 *            scores (academic, income, recommendation) on-chain.
 *
 *            Multi-member averaging rules:
 *            • At least 2 member scores required to finalise.
 *            • If any component diverges by > 20 between the first two
 *              scorers, a third member must score as tiebreaker.
 *            • Final score = arithmetic mean of all submitted scores.
 *            • Average is pushed to ScholarshipCore via COMMITTEE_ROLE.
 *
 *         2. DISPUTE RESOLUTION
 *            When a bounty hunter wins a dispute and the scholar submits
 *            counter-evidence, the programme's committee votes on it.
 *            Simple majority (> 50% of members) decides the outcome.
 *            Result is pushed to ScholarshipBounty via RESOLVER_ROLE.
 *
 *         ANTI-BIAS DESIGN
 *         • Initiator CANNOT be a committee member (prevents self-serving scores)
 *         • Members submit scores independently; results are only averaged
 *           — they cannot see each other's scores before submitting (enforced off-chain)
 *         • Tiebreaker requirement at > 20-point divergence mirrors jury systems
 *
 * UPGRADEABILITY
 *   UUPS — only UPGRADER_ROLE may authorise an upgrade.
 *
 * ROLES
 *   DEFAULT_ADMIN_ROLE – governance / multisig
 *   UPGRADER_ROLE      – proxy admin
 *   (NB: this contract itself has COMMITTEE_ROLE on Core and RESOLVER_ROLE on Bounty)
 */
contract CommitteeGovernance is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable
{
    // ── Roles ────────────────────────────────────────────────────────────────

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    string  public constant VERSION       = "4.0.0";

    // ── External contracts ───────────────────────────────────────────────────

    IScholarshipCore   public core;
    IScholarshipBounty public bounty;

    // ── Storage ──────────────────────────────────────────────────────────────

    // programId → committee member addresses
    mapping(uint256 => address[])                         private _committeeMembers;
    // programId → member → is member
    mapping(uint256 => mapping(address => bool))          public  isCommitteeMember;

    // Screening scores: programId → applicant → member → MemberScore
    struct MemberScore {
        uint256 academic;
        uint256 income;
        uint256 recommend;
        bool    submitted;
    }
    mapping(uint256 => mapping(address => mapping(address => MemberScore))) public memberScores;
    // programId → applicant → count of members who scored
    mapping(uint256 => mapping(address => uint256)) public scoreCount;
    // programId → applicant → score already finalised
    mapping(uint256 => mapping(address => bool))    public scoreFinalized;

    // Dispute voting: disputeId → member → voted
    mapping(uint256 => mapping(address => bool)) public hasVotedOnDispute;
    mapping(uint256 => uint256) public disputeVotesFor;     // votes for BH win
    mapping(uint256 => uint256) public disputeVotesAgainst; // votes for scholar

    // ── Events ───────────────────────────────────────────────────────────────

    event CommitteeMemberAdded(uint256 indexed programId, address member);
    event CommitteeMemberRemoved(uint256 indexed programId, address member);
    event MemberScoreSubmitted(uint256 indexed programId, address applicant, address member);
    event TiebreakerRequired(uint256 indexed programId, address applicant);
    event ScoreFinalized(uint256 indexed programId, address applicant, uint256 avgAcademic, uint256 avgIncome, uint256 avgRecommend);
    event DisputeVoteCast(uint256 indexed disputeId, address member, bool upholdDispute);
    event DisputeResolutionReached(uint256 indexed disputeId, bool bountyHunterWon);

    // ── Errors ───────────────────────────────────────────────────────────────

    error InitiatorCannotBeCommittee();
    error AlreadyCommitteeMember();
    error TooManyCommitteeMembers();
    error NotCommitteeMember();
    error AlreadyScored();
    error ScoreAlreadyFinalized();
    error AlreadyVotedOnDispute();
    error OnlyInitiator();

    // ── Constructor / Initializer ────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /**
     * @notice Proxy initializer.
     * @param admin    Initial admin.
     * @param _core    ScholarshipCore proxy address.
     * @param _bounty  ScholarshipBounty proxy address.
     */
    function initialize(
        address admin,
        address _core,
        address _bounty
    ) external initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE,      admin);

        core   = IScholarshipCore(_core);
        bounty = IScholarshipBounty(_bounty);
    }

    // ═══════════════════════════════════════════════════════════════════
    // COMMITTEE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Programme initiator adds a committee member.
     *         The initiator themselves cannot be added (anti-bias rule).
     *
     * @param programId  Target programme.
     * @param member     Wallet to add as committee member.
     */
    function addCommitteeMember(
        uint256 programId,
        address member
    ) external {
        ScholarshipTypes.Program memory prog = core.getProgram(programId);
        if (msg.sender != prog.initiator) revert OnlyInitiator();
        if (member == prog.initiator)     revert InitiatorCannotBeCommittee();
        if (isCommitteeMember[programId][member]) revert AlreadyCommitteeMember();
        if (_committeeMembers[programId].length >= ScholarshipTypes.MAX_COMMITTEE_MEMBERS)
            revert TooManyCommitteeMembers();

        isCommitteeMember[programId][member] = true;
        _committeeMembers[programId].push(member);

        emit CommitteeMemberAdded(programId, member);
    }

    /**
     * @notice Programme initiator removes a committee member.
     *         Note: existing scores and dispute votes already cast are unaffected.
     *
     * @param programId  Target programme.
     * @param member     Wallet to remove.
     */
    function removeCommitteeMember(uint256 programId, address member) external {
        ScholarshipTypes.Program memory prog = core.getProgram(programId);
        if (msg.sender != prog.initiator) revert OnlyInitiator();

        isCommitteeMember[programId][member] = false;
        emit CommitteeMemberRemoved(programId, member);
    }

    function getCommitteeMembers(uint256 programId)
        external view returns (address[] memory)
    {
        return _committeeMembers[programId];
    }

    // ═══════════════════════════════════════════════════════════════════
    // SCREENING SCORE SUBMISSION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice A committee member submits their scores for one applicant.
     *
     *         After submission:
     *         • If ≥ 2 members have scored AND no tiebreaker is needed →
     *           the averaged score is finalised and pushed to Core.
     *         • If the first two diverge by > 20 on any component →
     *           a third member must also score before finalisation.
     *
     * @param programId    Target programme.
     * @param applicant    Applicant wallet to score.
     * @param academicScore  Raw score 0–100.
     * @param incomeScore    Raw score 0–100.
     * @param recommendScore Raw score 0–100.
     */
    function submitScore(
        uint256 programId,
        address applicant,
        uint256 academicScore,
        uint256 incomeScore,
        uint256 recommendScore
    ) external {
        if (!isCommitteeMember[programId][msg.sender]) revert NotCommitteeMember();
        if (scoreFinalized[programId][applicant])      revert ScoreAlreadyFinalized();

        MemberScore storage existing = memberScores[programId][applicant][msg.sender];
        if (existing.submitted) revert AlreadyScored();

        memberScores[programId][applicant][msg.sender] = MemberScore({
            academic:   academicScore > 100 ? 100 : academicScore,
            income:     incomeScore   > 100 ? 100 : incomeScore,
            recommend:  recommendScore > 100 ? 100 : recommendScore,
            submitted:  true
        });

        scoreCount[programId][applicant]++;
        emit MemberScoreSubmitted(programId, applicant, msg.sender);

        _tryFinalizeScore(programId, applicant);
    }

    /**
     * @dev Attempt to finalise the score for an applicant.
     *      Needs at minimum 2 scores.  If divergence > 20 on academic or
     *      income components and only 2 have scored, emit TiebreakerRequired
     *      and wait for a third.
     */
    function _tryFinalizeScore(uint256 programId, address applicant) internal {
        uint256 count = scoreCount[programId][applicant];
        if (count < 2) return;

        address[] memory members = _committeeMembers[programId];

        uint256 sumAcademic;
        uint256 sumIncome;
        uint256 sumRecommend;
        uint256 scored;
        uint256 minAcademic = type(uint256).max;
        uint256 maxAcademic;
        uint256 minIncome   = type(uint256).max;
        uint256 maxIncome;

        for (uint256 i = 0; i < members.length; ) {
            MemberScore memory ms = memberScores[programId][applicant][members[i]];
            if (ms.submitted) {
                sumAcademic  += ms.academic;
                sumIncome    += ms.income;
                sumRecommend += ms.recommend;
                scored++;

                if (ms.academic < minAcademic) minAcademic = ms.academic;
                if (ms.academic > maxAcademic) maxAcademic = ms.academic;
                if (ms.income   < minIncome)   minIncome   = ms.income;
                if (ms.income   > maxIncome)   maxIncome   = ms.income;
            }
            unchecked { ++i; }
        }

        // Check tiebreaker requirement (divergence > 20 on any key component)
        bool needsTiebreaker = (maxAcademic - minAcademic > 20) ||
                               (maxIncome   - minIncome   > 20);

        if (needsTiebreaker && scored < 3) {
            emit TiebreakerRequired(programId, applicant);
            return;
        }

        // Finalise: push averaged score to Core
        uint256 avgAcademic  = sumAcademic  / scored;
        uint256 avgIncome    = sumIncome    / scored;
        uint256 avgRecommend = sumRecommend / scored;

        scoreFinalized[programId][applicant] = true;

        core.submitCommitteeScore(
            programId,
            applicant,
            avgAcademic,
            avgIncome,
            avgRecommend,
            address(this)
        );

        emit ScoreFinalized(programId, applicant, avgAcademic, avgIncome, avgRecommend);
    }

    // ═══════════════════════════════════════════════════════════════════
    // DISPUTE RESOLUTION VOTING
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Committee member votes on a dispute in their programme.
     *
     *         Uses simple majority (> 50% of committee size).
     *         Once majority is reached in either direction, the result is
     *         pushed to ScholarshipBounty.resolveDispute().
     *
     * @param disputeId       ID of the dispute to vote on.
     * @param upholdDispute   true = BH wins (scholar guilty).
     *                        false = BH loses (scholar innocent).
     */
    function voteOnDispute(
        uint256 disputeId,
        bool    upholdDispute
    ) external {
        ScholarshipTypes.Dispute memory d = bounty.getDispute(disputeId);

        if (!isCommitteeMember[d.programId][msg.sender]) revert NotCommitteeMember();
        if (hasVotedOnDispute[disputeId][msg.sender])    revert AlreadyVotedOnDispute();

        hasVotedOnDispute[disputeId][msg.sender] = true;

        if (upholdDispute) {
            disputeVotesFor[disputeId]++;
        } else {
            disputeVotesAgainst[disputeId]++;
        }

        emit DisputeVoteCast(disputeId, msg.sender, upholdDispute);

        // Check if simple majority reached
        uint256 totalMembers = _committeeMembers[d.programId].length;
        uint256 majority     = (totalMembers / 2) + 1;

        if (disputeVotesFor[disputeId] >= majority) {
            bounty.resolveDispute(disputeId, true);
            emit DisputeResolutionReached(disputeId, true);
        } else if (disputeVotesAgainst[disputeId] >= majority) {
            bounty.resolveDispute(disputeId, false);
            emit DisputeResolutionReached(disputeId, false);
        }
    }

    // ── UUPS ─────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}
}
