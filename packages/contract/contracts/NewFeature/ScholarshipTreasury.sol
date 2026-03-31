// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IScholarshipTreasury} from "../interfaces/IScholarship.sol";

/**
 * @title ScholarshipTreasury
 * @dev Custodian of all USDC in the scholarship protocol.
 *
 *  RESPONSIBILITIES:
 *  1. Hold program funds deposited by initiators
 *  2. Release milestone payments to scholars
 *  3. Distribute slash proceeds (BH reward + treasury + protocol fee)
 *  4. Manage yield accrual (Phase 2: Aave integration)
 *  5. Handle donor refunds on program cancellation
 *  6. Distribute yield share to voters pro-rata
 *
 *  YIELD FLOW (Phase 1 — simplified, no Aave yet):
 *  Protocol collects a portion of fees and distributes to voters
 *  proportional to their donation amount at program end.
 *
 *  YIELD FLOW (Phase 2 — Aave):
 *  Idle funds deposited to Aave aUSDC
 *  Yield harvested at program end and distributed to voters
 */
contract ScholarshipTreasury is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    IScholarshipTreasury
{
    using SafeERC20 for IERC20;

    bytes32 public constant UPGRADER_ROLE   = keccak256("UPGRADER_ROLE");
    bytes32 public constant CORE_ROLE       = keccak256("CORE_ROLE");
    bytes32 public constant BOUNTY_ROLE     = keccak256("BOUNTY_ROLE");

    // ── Storage ─────────────────────────────────────────────────────────────

    IERC20 public usdc;
    address public protocolFeeRecipient;

    // Program balances
    mapping(uint256 => uint256) public programBalance;
    mapping(uint256 => uint256) public programYield;

    // Donor tracking per program (for yield distribution and refunds)
    // programId → donor → net donated amount
    mapping(uint256 => mapping(address => uint256)) public donorBalance;
    mapping(uint256 => uint256) public programTotalDonated;
    mapping(uint256 => address[]) private _programDonors;

    // Confidence stakes
    // programId → staker → staked amount
    mapping(uint256 => mapping(address => uint256)) public confidenceStakes;
    mapping(uint256 => mapping(address => address)) public confidenceStakeFor; // who they staked on
    mapping(uint256 => uint256) public totalConfidenceStake;

    // Yield distribution tracking
    mapping(uint256 => mapping(address => bool)) public yieldClaimed;
    mapping(uint256 => bool) public yieldDistributed;

    // Protocol accumulated fees
    uint256 public protocolFeeAccumulated;

    // ── Events ──────────────────────────────────────────────────────────────

    event FundDeposited(uint256 indexed programId, address depositor, uint256 amount);
    event MilestoneDisbursed(uint256 indexed programId, address scholar, uint256 amount);
    event SlashDistributed(
        uint256 indexed programId,
        address scholar,
        address bountyHunter,
        uint256 bhReward,
        uint256 treasuryAmount,
        uint256 protocolAmount
    );
    event YieldDistributed(uint256 indexed programId, uint256 totalYield);
    event DonorRefunded(uint256 indexed programId, address donor, uint256 amount);
    event ConfidenceStakeDeposited(uint256 indexed programId, address voter, address scholar, uint256 amount);
    event ConfidenceStakeResolved(uint256 indexed programId, address voter, uint256 returned, uint256 bonus, bool slashed);
    event YieldClaimed(uint256 indexed programId, address voter, uint256 amount);

    // ── Errors ───────────────────────────────────────────────────────────────

    error InsufficientProgramBalance();
    error AlreadyClaimedYield();
    error YieldNotYetDistributed();
    error ConfidenceStakeAlreadyExists();
    error NothingToRefund();
    error TransferFailed();

    // ── Initializer ─────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address admin,
        address _usdc,
        address _protocolFeeRecipient
    ) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE,      admin);

        usdc                 = IERC20(_usdc);
        protocolFeeRecipient = _protocolFeeRecipient;
    }

    // ── Program Fund Management ──────────────────────────────────────────────

    /**
     * @dev Called by ScholarshipCore when a program is created.
     *      Initiator must approve this contract before calling.
     */
    function depositProgramFund(
        uint256 programId,
        uint256 amount
    ) external override onlyRole(CORE_ROLE) {
        programBalance[programId] += amount;
        emit FundDeposited(programId, msg.sender, amount);
    }

    /**
     * @dev Record a donor's contribution for yield/refund tracking.
     *      Called by ScholarshipCore after a donation is received.
     */
    function recordDonation(
        uint256 programId,
        address donor,
        uint256 netAmount
    ) external onlyRole(CORE_ROLE) {
        if (donorBalance[programId][donor] == 0) {
            _programDonors[programId].push(donor);
        }
        donorBalance[programId][donor]    += netAmount;
        programTotalDonated[programId]    += netAmount;
        programBalance[programId]         += netAmount;
        emit FundDeposited(programId, donor, netAmount);
    }

    // ── Milestone Disbursement ────────────────────────────────────────────────

    /**
     * @dev Release a milestone payment to a scholar.
     *      Only callable by ScholarshipCore after dispute window clears.
     */
    function disburseMilestone(
        address scholar,
        uint256 programId,
        uint256 milestoneId,
        uint256 amount
    ) external override nonReentrant onlyRole(CORE_ROLE) {
        if (programBalance[programId] < amount)
            revert InsufficientProgramBalance();

        programBalance[programId] -= amount;
        usdc.safeTransfer(scholar, amount);

        emit MilestoneDisbursed(programId, scholar, amount);
    }

    // ── Slash Distribution ────────────────────────────────────────────────────

    /**
     * @dev Distribute a slashed scholar's remaining funds.
     *      20% → Bounty Hunter
     *      70% → Treasury (back to program for reallocation)
     *      10% → Protocol fee
     *
     *      Also slashes confidence stakes of voters who backed this scholar.
     */
    function slashAndDistribute(
        uint256 programId,
        address scholar,
        address bountyHunter,
        uint256 bhPercent,
        uint256 treasuryPercent,
        uint256 protocolPercent
    ) external override nonReentrant onlyRole(BOUNTY_ROLE) returns (uint256 bhReward) {
        uint256 remaining = programBalance[programId];
        if (remaining == 0) revert InsufficientProgramBalance();

        // Calculate distribution
        bhReward = (remaining * bhPercent)       / 100;
        uint256 toTreasury = (remaining * treasuryPercent) / 100;
        uint256 toProtocol = remaining - bhReward - toTreasury;

        // Zero out program balance first (CEI pattern)
        programBalance[programId] = 0;

        // Transfer
        if (bhReward   > 0) usdc.safeTransfer(bountyHunter,        bhReward);
        if (toProtocol > 0) {
            usdc.safeTransfer(protocolFeeRecipient, toProtocol);
            protocolFeeAccumulated += toProtocol;
        }
        // toTreasury stays in contract (re-added to protocol reserve)

        emit SlashDistributed(programId, scholar, bountyHunter, bhReward, toTreasury, toProtocol);
    }

    // ── Confidence Stake ─────────────────────────────────────────────────────

    /**
     * @dev Voter deposits optional confidence stake on a scholar.
     *      This signals strong conviction and earns bonus yield if scholar succeeds.
     */
    function depositConfidenceStake(
        uint256 programId,
        address voter,
        address scholar,
        uint256 amount
    ) external nonReentrant onlyRole(CORE_ROLE) {
        if (confidenceStakes[programId][voter] > 0)
            revert ConfidenceStakeAlreadyExists();

        confidenceStakes[programId][voter]    = amount;
        confidenceStakeFor[programId][voter]  = scholar;
        totalConfidenceStake[programId]       += amount;

        emit ConfidenceStakeDeposited(programId, voter, scholar, amount);
    }

    /**
     * @dev Resolve confidence stake on program completion.
     *      Scholar SUCCEEDED: return stake + proportional yield bonus
     *      Scholar SLASHED: slash 50% of confidence stake
     */
    function resolveConfidenceStake(
        uint256 programId,
        address voter,
        bool scholarSucceeded
    ) external nonReentrant onlyRole(CORE_ROLE) {
        uint256 stake = confidenceStakes[programId][voter];
        if (stake == 0) return;

        confidenceStakes[programId][voter] = 0;

        if (scholarSucceeded) {
            // Return stake + 20% yield bonus from program yield pool
            uint256 bonus = (stake * 20) / 100;
            uint256 yieldAvailable = programYield[programId];
            uint256 actualBonus = bonus <= yieldAvailable ? bonus : yieldAvailable;
            programYield[programId] -= actualBonus;

            uint256 total = stake + actualBonus;
            usdc.safeTransfer(voter, total);
            emit ConfidenceStakeResolved(programId, voter, stake, actualBonus, false);
        } else {
            // Slash 50% of confidence stake
            uint256 slashAmount = stake / 2;
            uint256 returned    = stake - slashAmount;
            // slashAmount stays in treasury, returned goes back to voter
            usdc.safeTransfer(voter, returned);
            emit ConfidenceStakeResolved(programId, voter, returned, 0, true);
        }
    }

    // ── Yield Distribution ────────────────────────────────────────────────────

    /**
     * @dev Add yield to a program's pool.
     *      Phase 1: Called manually by protocol (from fee revenue).
     *      Phase 2: Called after harvesting Aave yield.
     */
    function addYield(uint256 programId, uint256 amount) external onlyRole(CORE_ROLE) {
        programYield[programId] += amount;
    }

    /**
     * @dev Mark yield as ready for distribution.
     *      Called when a program completes.
     */
    function distributeYield(uint256 programId) external override onlyRole(CORE_ROLE) {
        yieldDistributed[programId] = true;
        emit YieldDistributed(programId, programYield[programId]);
    }

    /**
     * @dev Voter claims their pro-rata share of program yield.
     *      Share = (voterDonation / totalDonated) * totalYield
     */
    function claimYield(uint256 programId, address voter) external nonReentrant {
        if (!yieldDistributed[programId])     revert YieldNotYetDistributed();
        if (yieldClaimed[programId][voter])   revert AlreadyClaimedYield();

        uint256 voterDonation = donorBalance[programId][voter];
        if (voterDonation == 0) revert NothingToRefund();

        uint256 totalDonated  = programTotalDonated[programId];
        uint256 totalYield    = programYield[programId];

        uint256 voterShare = (totalYield * voterDonation) / totalDonated;
        yieldClaimed[programId][voter] = true;

        if (voterShare > 0) {
            usdc.safeTransfer(voter, voterShare);
            emit YieldClaimed(programId, voter, voterShare);
        }
    }

    // ── Donor Refunds (on Cancellation) ──────────────────────────────────────

    /**
     * @dev Refund all donors when a program is cancelled.
     *      WARNING: This loops over all donors — programs should have
     *      reasonable donor counts to avoid gas limits.
     *      For large programs, use claimRefund() (pull pattern) instead.
     */
    function refundDonors(uint256 programId) external override onlyRole(CORE_ROLE) {
        address[] memory donors = _programDonors[programId];
        uint256 balance = programBalance[programId];
        uint256 total   = programTotalDonated[programId];

        for (uint256 i = 0; i < donors.length; ) {
            address donor   = donors[i];
            uint256 donated = donorBalance[programId][donor];
            if (donated > 0 && total > 0) {
                // Pro-rata refund from remaining balance
                uint256 refund = (balance * donated) / total;
                donorBalance[programId][donor] = 0;
                if (refund > 0) {
                    usdc.safeTransfer(donor, refund);
                    emit DonorRefunded(programId, donor, refund);
                }
            }
            unchecked { ++i; }
        }
        programBalance[programId] = 0;
    }

    /**
     * @dev Pull-pattern refund for individual donors.
     *      Safer for programs with many donors.
     */
    function claimRefund(uint256 programId, address donor) external nonReentrant onlyRole(CORE_ROLE) {
        uint256 donated = donorBalance[programId][donor];
        if (donated == 0) revert NothingToRefund();

        uint256 balance = programBalance[programId];
        uint256 total   = programTotalDonated[programId];
        uint256 refund  = total > 0 ? (balance * donated) / total : 0;

        donorBalance[programId][donor]  = 0;
        programBalance[programId]      -= refund;

        if (refund > 0) {
            usdc.safeTransfer(donor, refund);
            emit DonorRefunded(programId, donor, refund);
        }
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function getProgramBalance(uint256 programId)
        external view override returns (uint256) {
        return programBalance[programId];
    }

    function getAccruedYield(uint256 programId)
        external view override returns (uint256) {
        return programYield[programId];
    }

    function getProgramDonors(uint256 programId)
        external view returns (address[] memory) {
        return _programDonors[programId];
    }

    // ── UUPS ──────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}
}
