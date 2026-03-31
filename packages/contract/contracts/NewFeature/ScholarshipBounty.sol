// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ScholarshipTypes} from "../libraries/ScholarshipTypes.sol";
import {ScholarshipCore} from "./ScholarshipCore.sol";
import {ScholarshipTreasury} from "../finance/ScholarshipTreasury.sol";

/**
 * @title ScholarshipBounty
 * @dev Decentralized watchdog layer for the scholarship protocol.
 *
 *  BOUNTY HUNTER MECHANICS:
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │  Anyone can raise a dispute against an ACTIVE scholar           │
 *  │  at ANY point during the program — not just at milestones.      │
 *  │                                                                 │
 *  │  Examples of valid evidence:                                    │
 *  │  • Photo showing luxury car/house (contradicts income claim)    │
 *  │  • Real income documents different from submitted               │
 *  │  • Proof student dropped out of school                          │
 *  │  • Fabricated milestone documents                               │
 *  └─────────────────────────────────────────────────────────────────┘
 *
 *  STAKE MECHANISM:
 *  Stake = BH_STAKE_PERCENT (10%) of potential reward
 *  Potential reward = 20% of scholar's remaining fund
 *  This makes stake proportional — not too cheap, not too expensive.
 *
 *  ANTI-SPAM:
 *  • 1 active dispute per BH address at a time
 *  • 30-day cooldown after losing a dispute
 *  • 90-day cooldown if flagged as BAD_ACTOR (3 consecutive losses)
 *
 *  FRAUD TYPE → PENALTY MAPPING:
 *  • LIGHT_FRAUD     → 6 month freeze
 *  • MILESTONE_FRAUD → 1 year freeze
 *  • HEAVY_FRAUD     → 2 year freeze + permanent blacklist
 */
contract ScholarshipBounty is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;
    using ScholarshipTypes for *;

    bytes32 public constant UPGRADER_ROLE  = keccak256("UPGRADER_ROLE");
    bytes32 public constant RESOLVER_ROLE  = keccak256("RESOLVER_ROLE"); // Committee

    // ── External contracts ───────────────────────────────────────────────────

    IERC20              public usdc;
    ScholarshipCore     public core;
    ScholarshipTreasury public treasury;

    // ── Storage ──────────────────────────────────────────────────────────────

    uint256 private _nextDisputeId;

    mapping(uint256 => ScholarshipTypes.Dispute)         public disputes;
    mapping(address => ScholarshipTypes.BountyHunterRecord) public bhRecords;

    // scholar → programId → active disputeId (0 if none)
    mapping(address => mapping(uint256 => uint256)) public activeDisputeForScholar;

    // ── Events ───────────────────────────────────────────────────────────────

    event DisputeRaised(
        uint256 indexed disputeId,
        uint256 indexed programId,
        address indexed scholar,
        address bountyHunter,
        ScholarshipTypes.DisputeType disputeType,
        string evidenceCID,
        uint256 stake,
        uint256 potentialReward
    );
    event StudentResponded(uint256 indexed disputeId, string counterEvidenceCID);
    event StudentConceded(uint256 indexed disputeId, address scholar);
    event DisputeAutoGuilty(uint256 indexed disputeId, address scholar);
    event DisputeResolved(
        uint256 indexed disputeId,
        bool bountyHunterWon,
        uint256 bhReward
    );
    event BHFlagged(address indexed bountyHunter, uint256 cooldownUntil);

    // ── Errors ───────────────────────────────────────────────────────────────

    error BHHasActiveDispute();
    error BHOnCooldown(uint256 cooldownUntil);
    error ScholarNotActive();
    error ScholarAlreadyDisputed();
    error DisputeNotFound();
    error DisputeAlreadyResolved();
    error DefenseWindowStillOpen();
    error DefenseWindowExpired();
    error NotScholar();
    error NotResolver();
    error InvalidStakeAmount();
    error StakeTransferFailed();

    // ── Initializer ──────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address admin,
        address _usdc,
        address _core,
        address _treasury
    ) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE,      admin);
        _grantRole(RESOLVER_ROLE,      admin); // Committee gets this role

        usdc     = IERC20(_usdc);
        core     = ScholarshipCore(_core);
        treasury = ScholarshipTreasury(_treasury);
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 1 — RAISE DISPUTE
    // ════════════════════════════════════════════════════════════════

    /**
     * @dev Raise a dispute against an active scholar.
     *      Can target a specific milestone OR the program in general
     *      (set milestoneId = 0 for program-level dispute).
     *
     *      Stake = 10% of potential reward (20% of remaining fund).
     *      BH must approve USDC before calling.
     */
    function raiseDispute(
        uint256 programId,
        address scholar,
        uint256 milestoneId,           // 0 for program-level
        ScholarshipTypes.DisputeType disputeType,
        string calldata evidenceCID
    ) external nonReentrant {
        ScholarshipTypes.BountyHunterRecord storage bh = bhRecords[msg.sender];

        // Anti-spam checks
        if (bh.activeDisputeId != 0) revert BHHasActiveDispute();
        if (block.timestamp < bh.cooldownUntil)
            revert BHOnCooldown(bh.cooldownUntil);

        // Scholar must be active
        ScholarshipTypes.Scholar memory scholarData = core.getScholar(scholar, programId);
        if (scholarData.status != ScholarshipTypes.StudentStatus.ACTIVE)
            revert ScholarNotActive();

        // No duplicate disputes
        if (activeDisputeForScholar[scholar][programId] != 0)
            revert ScholarAlreadyDisputed();

        // Calculate stake and potential reward
        uint256 remainingFund   = core.getRemainingFund(scholar, programId);
        ScholarshipTypes.Program memory prog = core.getProgram(programId);

        uint256 potentialReward = (remainingFund * prog.slashDist.bountyHunterPercent) / 100;
        uint256 stakeRequired   = (potentialReward * ScholarshipTypes.BH_STAKE_PERCENT) / 100;

        if (stakeRequired > 0) {
            usdc.safeTransferFrom(msg.sender, address(this), stakeRequired);
        }

        // Create dispute
        uint256 disputeId = ++_nextDisputeId;

        disputes[disputeId] = ScholarshipTypes.Dispute({
            id:                 disputeId,
            programId:          programId,
            scholar:            scholar,
            milestoneId:        milestoneId,
            bountyHunter:       msg.sender,
            disputeType:        disputeType,
            status:             ScholarshipTypes.DisputeStatus.ACTIVE,
            evidenceCID:        evidenceCID,
            counterEvidenceCID: "",
            stake:              stakeRequired,
            potentialReward:    potentialReward,
            raisedAt:           block.timestamp,
            defenseDeadline:    block.timestamp + ScholarshipTypes.DEFENSE_WINDOW,
            resolvedAt:         0,
            resolvedBy:         address(0)
        });

        bh.activeDisputeId = disputeId;
        activeDisputeForScholar[scholar][programId] = disputeId;

        // Freeze relevant milestone if milestone-specific
        if (milestoneId != 0) {
            core.freezeMilestone(milestoneId);
        }

        emit DisputeRaised(
            disputeId, programId, scholar, msg.sender,
            disputeType, evidenceCID, stakeRequired, potentialReward
        );
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 2 — STUDENT DEFENSE
    // ════════════════════════════════════════════════════════════════

    /**
     * @dev Scholar submits counter-evidence within the 7-day defense window.
     *      After this, committee reviews both sides.
     */
    function submitCounterEvidence(
        uint256 disputeId,
        string calldata counterEvidenceCID
    ) external nonReentrant {
        ScholarshipTypes.Dispute storage d = disputes[disputeId];
        if (d.id == 0) revert DisputeNotFound();
        if (d.status != ScholarshipTypes.DisputeStatus.ACTIVE)
            revert DisputeAlreadyResolved();
        if (msg.sender != d.scholar) revert NotScholar();
        if (block.timestamp > d.defenseDeadline) revert DefenseWindowExpired();

        d.counterEvidenceCID = counterEvidenceCID;
        emit StudentResponded(disputeId, counterEvidenceCID);
    }

    /**
     * @dev Scholar concedes — accepts the dispute as valid.
     *      Faster resolution without committee review.
     *      Penalty still applies but process is immediate.
     */
    function concede(uint256 disputeId) external nonReentrant {
        ScholarshipTypes.Dispute storage d = disputes[disputeId];
        if (d.id == 0) revert DisputeNotFound();
        if (d.status != ScholarshipTypes.DisputeStatus.ACTIVE)
            revert DisputeAlreadyResolved();
        if (msg.sender != d.scholar) revert NotScholar();

        d.status     = ScholarshipTypes.DisputeStatus.STUDENT_CONCEDED;
        d.resolvedAt = block.timestamp;

        _executeBHWin(disputeId);
        emit StudentConceded(disputeId, msg.sender);
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 2B — AUTO-GUILTY (no response in 7 days)
    // ════════════════════════════════════════════════════════════════

    /**
     * @dev Anyone can trigger auto-guilty after defense window expires
     *      with no student response. Small incentive fee for caller.
     */
    function triggerAutoGuilty(uint256 disputeId) external nonReentrant {
        ScholarshipTypes.Dispute storage d = disputes[disputeId];
        if (d.id == 0) revert DisputeNotFound();
        if (d.status != ScholarshipTypes.DisputeStatus.ACTIVE)
            revert DisputeAlreadyResolved();
        if (block.timestamp <= d.defenseDeadline)
            revert DefenseWindowStillOpen();
        if (bytes(d.counterEvidenceCID).length > 0)
            revert DefenseWindowStillOpen(); // Student responded — need committee

        d.status     = ScholarshipTypes.DisputeStatus.AUTO_GUILTY;
        d.resolvedAt = block.timestamp;

        _executeBHWin(disputeId);
        emit DisputeAutoGuilty(disputeId, d.scholar);
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 3 — COMMITTEE RESOLUTION
    // ════════════════════════════════════════════════════════════════

    /**
     * @dev Committee resolves a dispute where student submitted counter-evidence.
     *      Only callable by addresses with RESOLVER_ROLE.
     *
     * @param bountyHunterWon  true  = BH wins, scholar is guilty
     *                         false = BH loses, scholar is innocent
     */
    function resolveDispute(
        uint256 disputeId,
        bool bountyHunterWon
    ) external nonReentrant onlyRole(RESOLVER_ROLE) {
        ScholarshipTypes.Dispute storage d = disputes[disputeId];
        if (d.id == 0) revert DisputeNotFound();
        if (d.status != ScholarshipTypes.DisputeStatus.ACTIVE)
            revert DisputeAlreadyResolved();
        // Must have counter evidence (otherwise use triggerAutoGuilty)
        require(bytes(d.counterEvidenceCID).length > 0, "Use triggerAutoGuilty");

        d.resolvedAt = block.timestamp;
        d.resolvedBy = msg.sender;

        if (bountyHunterWon) {
            d.status = ScholarshipTypes.DisputeStatus.BH_WON;
            _executeBHWin(disputeId);
        } else {
            d.status = ScholarshipTypes.DisputeStatus.BH_LOST;
            _executeBHLoss(disputeId);
        }

        emit DisputeResolved(
            disputeId,
            bountyHunterWon,
            bountyHunterWon ? d.potentialReward : 0
        );
    }

    // ════════════════════════════════════════════════════════════════
    // RESOLUTION EXECUTION
    // ════════════════════════════════════════════════════════════════

    function _executeBHWin(uint256 disputeId) internal {
        ScholarshipTypes.Dispute storage d = disputes[disputeId];
        ScholarshipTypes.BountyHunterRecord storage bh = bhRecords[d.bountyHunter];
        ScholarshipTypes.Program memory prog = core.getProgram(d.programId);

        // Slash scholar via Core
        core.slashScholar(d.scholar, d.programId, d.disputeType);

        // Distribute remaining funds via Treasury
        treasury.slashAndDistribute(
            d.programId,
            d.scholar,
            d.bountyHunter,
            prog.slashDist.bountyHunterPercent,
            prog.slashDist.treasuryPercent,
            prog.slashDist.protocolPercent
        );

        // Return BH stake (they won, get it back)
        if (d.stake > 0) {
            usdc.safeTransfer(d.bountyHunter, d.stake);
        }

        // Update BH record
        bh.activeDisputeId    = 0;
        bh.totalWins          += 1;
        bh.consecutiveLosses  = 0; // reset on win
        // No cooldown for winners

        activeDisputeForScholar[d.scholar][d.programId] = 0;
    }

    function _executeBHLoss(uint256 disputeId) internal {
        ScholarshipTypes.Dispute storage d = disputes[disputeId];
        ScholarshipTypes.BountyHunterRecord storage bh = bhRecords[d.bountyHunter];

        // Release frozen milestone if applicable
        if (d.milestoneId != 0) {
            core.releaseMilestone(d.milestoneId);
        }

        // BH stake is forfeited — stays in this contract (goes to protocol)
        // (No transfer needed — it's already here)

        // Update BH record with cooldown
        bh.activeDisputeId     = 0;
        bh.totalLosses         += 1;
        bh.consecutiveLosses   += 1;

        uint256 cooldown;
        if (bh.consecutiveLosses >= 3) {
            bh.isFlagged = true;
            cooldown     = ScholarshipTypes.BH_COOLDOWN_FLAGGED;
            emit BHFlagged(d.bountyHunter, block.timestamp + cooldown);
        } else {
            cooldown = ScholarshipTypes.BH_COOLDOWN_NORMAL;
        }

        bh.cooldownUntil = block.timestamp + cooldown;
        activeDisputeForScholar[d.scholar][d.programId] = 0;
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function getDispute(uint256 disputeId)
        external view returns (ScholarshipTypes.Dispute memory) {
        return disputes[disputeId];
    }

    function getBHRecord(address bh)
        external view returns (ScholarshipTypes.BountyHunterRecord memory) {
        return bhRecords[bh];
    }

    function calculateStake(
        address scholar,
        uint256 programId
    ) external view returns (uint256 stakeRequired, uint256 potentialReward) {
        uint256 remaining     = core.getRemainingFund(scholar, programId);
        ScholarshipTypes.Program memory prog = core.getProgram(programId);
        potentialReward       = (remaining * prog.slashDist.bountyHunterPercent) / 100;
        stakeRequired         = (potentialReward * ScholarshipTypes.BH_STAKE_PERCENT) / 100;
    }

    // ── Withdraw forfeited stakes (to protocol) ───────────────────────────────

    function withdrawForfeitedStakes(address recipient)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        uint256 bal = usdc.balanceOf(address(this));
        if (bal > 0) usdc.safeTransfer(recipient, bal);
    }

    // ── UUPS ──────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}
}
