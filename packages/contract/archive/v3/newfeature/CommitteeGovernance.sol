// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ScholarshipTypes} from "../libraries/ScholarshipTypes.sol";
import {ScholarshipCore} from "../core/ScholarshipCore.sol";
import {ScholarshipBounty} from "../core/ScholarshipBounty.sol";

/**
 * @title CommitteeGovernance
 * @dev Manages committee members for each program.
 *      Handles two responsibilities:
 *
 *  1. SCREENING SCORES (BY_COMMITTEE mode)
 *     Committee members review applicant documents (off-chain via IPFS)
 *     and submit scores on-chain. If multiple members score the same
 *     applicant, the average is used. If scores diverge by >20 points,
 *     a third member is required as tiebreaker.
 *
 *  2. DISPUTE RESOLUTION
 *     When a bounty hunter wins a dispute and the scholar submits
 *     counter-evidence, the committee votes to resolve it.
 *     Simple majority decides the outcome.
 *
 *  ANTI-BIAS DESIGN:
 *  - Initiator CANNOT be a committee member (prevents self-serving scores)
 *  - Committee members are assigned RANDOMLY to applicants (prevents
 *    targeted favoritism — like a jury system)
 *  - Scores from different members are averaged; large divergences
 *    trigger mandatory third review
 */
contract CommitteeGovernance is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable
{
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // ── External contracts ───────────────────────────────────────────────────

    ScholarshipCore   public core;
    ScholarshipBounty public bounty;

    // ── Storage ──────────────────────────────────────────────────────────────

    // programId → list of committee member addresses
    mapping(uint256 => address[]) private _committeeMembers;
    mapping(uint256 => mapping(address => bool)) public isCommitteeMember;

    // Screening score tracking
    // programId → applicant → member → score submitted
    struct MemberScore {
        uint256 academic;
        uint256 income;
        uint256 recommend;
        bool    submitted;
    }
    mapping(uint256 => mapping(address => mapping(address => MemberScore)))
        public memberScores;

    // programId → applicant → how many members scored them
    mapping(uint256 => mapping(address => uint256)) public scoreCount;

    // Dispute resolution voting
    // disputeId → committee member → vote (true = BH wins)
    mapping(uint256 => mapping(address => bool))  public disputeVotes;
    mapping(uint256 => mapping(address => bool))  public hasVotedOnDispute;
    mapping(uint256 => uint256) public disputeVotesFor;    // votes for BH win
    mapping(uint256 => uint256) public disputeVotesAgainst;
    mapping(uint256 => uint256) public disputeVoteProgramId; // track which program

    // ── Events ───────────────────────────────────────────────────────────────

    event CommitteeMemberAdded(uint256 indexed programId, address member);
    event CommitteeMemberRemoved(uint256 indexed programId, address member);
    event ScoreSubmitted(uint256 indexed programId, address applicant, address member);
    event ScoreFinalized(uint256 indexed programId, address applicant, uint256 finalScore);
    event TiebreakerRequired(uint256 indexed programId, address applicant);
    event DisputeVoteCast(uint256 indexed disputeId, address member, bool upholdDispute);
    event DisputeResolutionReached(uint256 indexed disputeId, bool bountyHunterWon);

    // ── Errors ───────────────────────────────────────────────────────────────

    error InitiatorCannotBeCommittee();
    error AlreadyCommitteeMember();
    error NotCommitteeMember();
    error AlreadyScored();
    error AlreadyVotedOnDispute();
    error TiebreakerRequiredFirst();
    error InsufficientVotes();

    // ── Initializer ──────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address admin,
        address _core,
        address _bounty
    ) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE,      admin);

        core   = ScholarshipCore(_core);
        bounty = ScholarshipBounty(_bounty);
    }

    // ── Committee Management ─────────────────────────────────────────────────

    /**
     * @dev Initiator adds committee members for their program.
     *      Initiator themselves cannot be a member (anti-bias).
     */
    function addCommitteeMember(
        uint256 programId,
        address member
    ) external {
        ScholarshipTypes.Program memory prog = core.getProgram(programId);
        require(msg.sender == prog.initiator, "Only initiator");

        if (member == prog.initiator) revert InitiatorCannotBeCommittee();
        if (isCommitteeMember[programId][member]) revert AlreadyCommitteeMember();

        isCommitteeMember[programId][member] = true;
        _committeeMembers[programId].push(member);

        emit CommitteeMemberAdded(programId, member);
    }

    function removeCommitteeMember(uint256 programId, address member) external {
        ScholarshipTypes.Program memory prog = core.getProgram(programId);
        require(msg.sender == prog.initiator, "Only initiator");
        isCommitteeMember[programId][member] = false;
        emit CommitteeMemberRemoved(programId, member);
    }

    function getCommitteeMembers(uint256 programId)
        external view returns (address[] memory) {
        return _committeeMembers[programId];
    }

    // ── Screening Score Submission ────────────────────────────────────────────

    /**
     * @dev Committee member submits score for an applicant.
     *      Each member can only score each applicant once.
     *      If 2 members have scored and their scores diverge > 20 points
     *      on any component, a third member must score as tiebreaker.
     */
    function submitScore(
        uint256 programId,
        address applicant,
        uint256 academicScore,
        uint256 incomeScore,
        uint256 recommendScore
    ) external {
        if (!isCommitteeMember[programId][msg.sender])
            revert NotCommitteeMember();

        MemberScore storage existing = memberScores[programId][applicant][msg.sender];
        if (existing.submitted) revert AlreadyScored();

        memberScores[programId][applicant][msg.sender] = MemberScore({
            academic:   academicScore,
            income:     incomeScore,
            recommend:  recommendScore,
            submitted:  true
        });

        scoreCount[programId][applicant]++;
        emit ScoreSubmitted(programId, applicant, msg.sender);

        // Try to finalize if we have enough scores
        _tryFinalizeScore(programId, applicant);
    }

    function _tryFinalizeScore(uint256 programId, address applicant) internal {
        uint256 count = scoreCount[programId][applicant];
        if (count < 2) return; // Need at least 2 scores

        address[] memory members = _committeeMembers[programId];
        uint256 sumAcademic;
        uint256 sumIncome;
        uint256 sumRecommend;
        uint256 scoredCount;

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
                scoredCount++;

                if (ms.academic < minAcademic) minAcademic = ms.academic;
                if (ms.academic > maxAcademic) maxAcademic = ms.academic;
                if (ms.income   < minIncome)   minIncome   = ms.income;
                if (ms.income   > maxIncome)    maxIncome   = ms.income;
            }
            unchecked { ++i; }
        }

        // Check if tiebreaker needed (divergence > 20 on any component)
        bool needsTiebreaker = (maxAcademic - minAcademic > 20) ||
                               (maxIncome   - minIncome   > 20);

        if (needsTiebreaker && scoredCount < 3) {
            emit TiebreakerRequired(programId, applicant);
            return; // Wait for third scorer
        }

        // Finalize: submit average score to Core
        uint256 avgAcademic  = sumAcademic  / scoredCount;
        uint256 avgIncome    = sumIncome    / scoredCount;
        uint256 avgRecommend = sumRecommend / scoredCount;

        core.submitCommitteeScore(
            programId,
            applicant,
            avgAcademic,
            avgIncome,
            avgRecommend,
            address(this)
        );

        emit ScoreFinalized(programId, applicant, avgAcademic);
    }

    // ── Dispute Resolution Voting ─────────────────────────────────────────────

    /**
     * @dev Committee member votes on a dispute.
     *      Uses the committee of the program the scholar belongs to.
     *      Simple majority (>50%) decides.
     */
    function voteOnDispute(
        uint256 disputeId,
        bool upholdDispute // true = BH wins, false = student innocent
    ) external {
        ScholarshipTypes.Dispute memory d = bounty.getDispute(disputeId);
        if (!isCommitteeMember[d.programId][msg.sender])
            revert NotCommitteeMember();
        if (hasVotedOnDispute[disputeId][msg.sender])
            revert AlreadyVotedOnDispute();

        hasVotedOnDispute[disputeId][msg.sender] = true;
        disputeVoteProgramId[disputeId]          = d.programId;

        if (upholdDispute) {
            disputeVotesFor[disputeId]++;
        } else {
            disputeVotesAgainst[disputeId]++;
        }

        emit DisputeVoteCast(disputeId, msg.sender, upholdDispute);

        // Check if majority reached
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

    // ── UUPS ──────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}
}
