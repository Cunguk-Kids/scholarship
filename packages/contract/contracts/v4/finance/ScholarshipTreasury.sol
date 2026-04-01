// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IScholarshipTreasury} from "../interfaces/IScholarship.sol";
import {ScholarshipTypes}     from "../libraries/ScholarshipTypes.sol";

/**
 * @title  ScholarshipTreasury
 * @author Scholarship Protocol
 * @notice Custodian of all USDC in the scholarship protocol.
 *
 * @dev    RESPONSIBILITIES
 *         1. Hold program funds deposited by initiators
 *         2. Hold donor contributions and track pro-rata shares
 *         3. Release milestone payments to scholars
 *         4. Distribute slash proceeds (BH reward + treasury reserve + protocol)
 *         5. Manage confidence-stake lifecycle (deposit → resolve/slash)
 *         6. Distribute yield share to voters at programme end
 *         7. Refund donors on programme cancellation
 *
 *         YIELD (Phase 1)
 *         Protocol accumulates a fraction of fees and distributes pro-rata
 *         to donors at programme end.
 *
 *         YIELD (Phase 2 — future)
 *         Idle funds will be deposited to Aave aUSDC; yield harvested at end.
 *         The interface is already yield-aware so no architecture change is needed.
 *
 * UPGRADE
 *   UUPS — only UPGRADER_ROLE may authorise an upgrade.
 *
 * ROLES
 *   DEFAULT_ADMIN_ROLE – governance / multisig
 *   UPGRADER_ROLE      – proxy admin
 *   CORE_ROLE          – ScholarshipCore (program setup, milestones, yield)
 *   BOUNTY_ROLE        – ScholarshipBounty (slash execution)
 */
contract ScholarshipTreasury is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    IScholarshipTreasury
{
    using SafeERC20 for IERC20;

    // ── Roles ────────────────────────────────────────────────────────────────

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant CORE_ROLE     = keccak256("CORE_ROLE");
    bytes32 public constant BOUNTY_ROLE   = keccak256("BOUNTY_ROLE");

    string  public constant VERSION       = "4.0.0";

    // ── Storage ──────────────────────────────────────────────────────────────

    IERC20  public usdc;
    address public protocolFeeRecipient;

    // -- Program balances and yield ----------------------------------------
    mapping(uint256 => uint256) public programBalance;
    mapping(uint256 => uint256) public programYield;

    // -- Donor tracking per program (yield distribution + refunds) ----------
    // programId → donor → net donated amount
    mapping(uint256 => mapping(address => uint256)) public donorBalance;
    mapping(uint256 => uint256)                     public programTotalDonated;
    mapping(uint256 => address[])                  private _programDonors;

    // -- Confidence stakes --------------------------------------------------
    // programId → voter → staked amount
    mapping(uint256 => mapping(address => uint256)) public confidenceStakes;
    // programId → voter → scholar they staked on
    mapping(uint256 => mapping(address => address)) public confidenceStakeFor;
    mapping(uint256 => uint256)                     public totalConfidenceStake;

    // -- Yield claim tracking -----------------------------------------------
    mapping(uint256 => mapping(address => bool)) public yieldClaimed;
    mapping(uint256 => bool)                     public yieldDistributed;

    // -- Protocol fee accumulator ------------------------------------------
    uint256 public protocolFeeAccumulated;

    // ── Events ───────────────────────────────────────────────────────────────

    event FundDeposited(uint256 indexed programId, address depositor, uint256 amount);
    event DonationRecorded(uint256 indexed programId, address donor, uint256 netAmount);
    event MilestoneDisbursed(uint256 indexed programId, address scholar, uint256 milestoneId, uint256 amount);
    event SlashDistributed(
        uint256 indexed programId,
        address indexed scholar,
        address indexed bountyHunter,
        uint256 bhReward,
        uint256 treasuryAmount,
        uint256 protocolAmount
    );
    event ConfidenceStakeDeposited(uint256 indexed programId, address voter, address scholar, uint256 amount);
    event ConfidenceStakeResolved(
        uint256 indexed programId,
        address indexed voter,
        uint256 returned,
        uint256 bonus,
        bool    slashed
    );
    event YieldAdded(uint256 indexed programId, uint256 amount);
    event YieldDistributed(uint256 indexed programId, uint256 totalYield);
    event YieldClaimed(uint256 indexed programId, address voter, uint256 amount);
    event DonorRefunded(uint256 indexed programId, address donor, uint256 amount);

    // ── Errors ───────────────────────────────────────────────────────────────

    error InsufficientProgramBalance();
    error AlreadyClaimedYield();
    error YieldNotYetDistributed();
    error ConfidenceStakeAlreadyExists();
    error NothingToRefund();
    error NothingToWithdraw();
    error TooManyDonorsForPushRefund();

    // ── Constructor / Initializer ────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /**
     * @notice Proxy initializer.
     * @param admin                  Initial admin (multisig recommended).
     * @param _usdc                  USDC token address.
     * @param _protocolFeeRecipient  Address that receives protocol's share.
     */
    function initialize(
        address admin,
        address _usdc,
        address _protocolFeeRecipient
    ) external initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE,      admin);

        usdc                 = IERC20(_usdc);
        protocolFeeRecipient = _protocolFeeRecipient;
    }

    // ═══════════════════════════════════════════════════════════════════
    // PROGRAM FUND MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Record initator fund deposit when a program is created.
     *         USDC was already transferred directly to this contract by Core.
     */
    function depositProgramFund(
        uint256 programId,
        uint256 amount
    ) external override onlyRole(CORE_ROLE) {
        programBalance[programId] += amount;
        emit FundDeposited(programId, msg.sender, amount);
    }

    /**
     * @notice Record a donor's contribution for yield/refund accounting.
     *         USDC was already transferred to this contract by Core.
     *
     * @dev    First donation from a new address pushes to the donors list so
     *         it can be iterated during refunds / yield distribution.
     */
    function recordDonation(
        uint256 programId,
        address donor,
        uint256 netAmount
    ) external override onlyRole(CORE_ROLE) {
        if (donorBalance[programId][donor] == 0) {
            _programDonors[programId].push(donor);
        }
        donorBalance[programId][donor] += netAmount;
        programTotalDonated[programId] += netAmount;
        programBalance[programId]      += netAmount;

        emit DonationRecorded(programId, donor, netAmount);
    }

    // ═══════════════════════════════════════════════════════════════════
    // MILESTONE DISBURSEMENT
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Release one milestone payment to a scholar.
     *         Called by Core after the dispute window expires with no challenge,
     *         or after the BH loses a dispute.
     *
     * @dev    CEI: balance decremented before transfer.
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

        emit MilestoneDisbursed(programId, scholar, milestoneId, amount);
    }

    // ═══════════════════════════════════════════════════════════════════
    // SLASH DISTRIBUTION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Distribute a fraudulent scholar's remaining program balance.
     *
     *         Default split: 20% → BH, 70% → treasury reserve, 10% → protocol.
     *         The treasury share stays in this contract for reallocation.
     *
     * @dev    CEI: programBalance zeroed BEFORE any transfer.
     * @return bhReward Amount sent to the bounty hunter.
     */
    function slashAndDistribute(
        uint256 programId,
        address scholarAddr,
        address bountyHunter,
        uint256 bhPercent,
        uint256, /* treasuryPercent — treasury share stays in contract, no transfer */
        uint256 protocolPercent
    ) external override nonReentrant onlyRole(BOUNTY_ROLE) returns (uint256 bhReward) {
        uint256 remaining = programBalance[programId];
        if (remaining == 0) revert InsufficientProgramBalance();

        // CEI: zero balance first
        programBalance[programId] = 0;

        bhReward             = (remaining * bhPercent)      / 100;
        uint256 toProtocol   = (remaining * protocolPercent) / 100;
        // remainder (treasuryPercent) stays in contract — no transfer needed

        if (bhReward   > 0) usdc.safeTransfer(bountyHunter,        bhReward);
        if (toProtocol > 0) {
            usdc.safeTransfer(protocolFeeRecipient, toProtocol);
            protocolFeeAccumulated += toProtocol;
        }

        uint256 toTreasury = remaining - bhReward - toProtocol; // implicitly = treasuryPercent share
        emit SlashDistributed(programId, scholarAddr, bountyHunter, bhReward, toTreasury, toProtocol);
    }

    // ═══════════════════════════════════════════════════════════════════
    // CONFIDENCE STAKE
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Lock a voter's optional conviction stake.
     *         USDC was already transferred to this contract by Core.
     *         One stake per voter per program.
     */
    function depositConfidenceStake(
        uint256 programId,
        address voter,
        address scholar,
        uint256 amount
    ) external override nonReentrant onlyRole(CORE_ROLE) {
        if (confidenceStakes[programId][voter] > 0)
            revert ConfidenceStakeAlreadyExists();

        confidenceStakes[programId][voter]   = amount;
        confidenceStakeFor[programId][voter] = scholar;
        totalConfidenceStake[programId]      += amount;

        emit ConfidenceStakeDeposited(programId, voter, scholar, amount);
    }

    /**
     * @notice Resolve a voter's confidence stake on programme end.
     *
     *         Scholar SUCCEEDED → return principal + 20% yield bonus.
     *         Scholar SLASHED   → slash 50% of stake (rest returned).
     *
     * @dev    CEI: zero stake before transfer.
     */
    function resolveConfidenceStake(
        uint256 programId,
        address voter,
        bool    scholarSucceeded
    ) external override nonReentrant onlyRole(CORE_ROLE) {
        uint256 stake = confidenceStakes[programId][voter];
        if (stake == 0) return;

        // CEI
        confidenceStakes[programId][voter] = 0;

        if (scholarSucceeded) {
            // 20% bonus from yield pool, capped by available yield
            uint256 bonus         = (stake * 20) / 100;
            uint256 yieldAvail    = programYield[programId];
            uint256 actualBonus   = bonus <= yieldAvail ? bonus : yieldAvail;
            programYield[programId] -= actualBonus;

            uint256 total = stake + actualBonus;
            usdc.safeTransfer(voter, total);
            emit ConfidenceStakeResolved(programId, voter, stake, actualBonus, false);
        } else {
            // 50% slashed — stays in treasury, rest returned
            uint256 slashAmt = stake / 2;
            uint256 returned = stake - slashAmt;
            usdc.safeTransfer(voter, returned);
            emit ConfidenceStakeResolved(programId, voter, returned, 0, true);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // YIELD
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Add yield to a programme's pool.
     *         Phase 1: Manual (from protocol fee revenue).
     *         Phase 2: Automated after harvesting Aave aUSDC positions.
     */
    function addYield(
        uint256 programId,
        uint256 amount
    ) external override onlyRole(CORE_ROLE) {
        programYield[programId] += amount;
        emit YieldAdded(programId, amount);
    }

    /**
     * @notice Mark yield as ready for individual claims.
     *         Called once when a programme completes.
     */
    function distributeYield(uint256 programId)
        external override onlyRole(CORE_ROLE)
    {
        yieldDistributed[programId] = true;
        emit YieldDistributed(programId, programYield[programId]);
    }

    /**
     * @notice Voter pulls their pro-rata yield share.
     *         Share = (voterDonation / totalDonated) × totalYield
     *
     * @dev    Permissionless pull so any voter can claim at any time
     *         after the programme completes.  Safe — state updated before transfer.
     */
    function claimYield(uint256 programId, address voter)
        external nonReentrant
    {
        if (!yieldDistributed[programId])    revert YieldNotYetDistributed();
        if (yieldClaimed[programId][voter])  revert AlreadyClaimedYield();

        uint256 voterDonation = donorBalance[programId][voter];
        if (voterDonation == 0) revert NothingToRefund();

        uint256 totalDonated = programTotalDonated[programId];
        uint256 totalYield   = programYield[programId];
        uint256 voterShare   = (totalYield * voterDonation) / totalDonated;

        yieldClaimed[programId][voter] = true;

        if (voterShare > 0) {
            usdc.safeTransfer(voter, voterShare);
            emit YieldClaimed(programId, voter, voterShare);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // DONOR REFUNDS (on cancellation)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Push-refund all donors when a programme is cancelled.
     *
     * @dev    Only safe for small programmes (≤ MAX_PUSH_REFUND_DONORS donors).
     *         For larger programmes the loop will revert — use claimRefund()
     *         (pull pattern) instead.
     */
    function refundDonors(uint256 programId)
        external override nonReentrant onlyRole(CORE_ROLE)
    {
        address[] memory donors  = _programDonors[programId];
        if (donors.length > ScholarshipTypes.MAX_PUSH_REFUND_DONORS)
            revert TooManyDonorsForPushRefund();
        uint256          balance = programBalance[programId];
        uint256          total   = programTotalDonated[programId];

        // CEI: zero balance first
        programBalance[programId] = 0;

        for (uint256 i = 0; i < donors.length; ) {
            address donor   = donors[i];
            uint256 donated = donorBalance[programId][donor];
            if (donated > 0 && total > 0) {
                uint256 refund = (balance * donated) / total;
                donorBalance[programId][donor] = 0;
                if (refund > 0) {
                    usdc.safeTransfer(donor, refund);
                    emit DonorRefunded(programId, donor, refund);
                }
            }
            unchecked { ++i; }
        }
    }

    /**
     * @notice Pull-pattern refund for individual donors.
     *         Safer for large donor lists; recommended for programmatic callers.
     */
    function claimRefund(uint256 programId, address donor)
        external nonReentrant
    {
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

    // ═══════════════════════════════════════════════════════════════════
    // VIEWS
    // ═══════════════════════════════════════════════════════════════════

    function getProgramBalance(uint256 programId)
        external view override returns (uint256)
    {
        return programBalance[programId];
    }

    function getAccruedYield(uint256 programId)
        external view override returns (uint256)
    {
        return programYield[programId];
    }

    function getProgramDonors(uint256 programId)
        external view override returns (address[] memory)
    {
        return _programDonors[programId];
    }

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN UTILITIES
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Update the protocol fee recipient address.
     *         Only DEFAULT_ADMIN_ROLE (multisig) may call.
     */
    function setProtocolFeeRecipient(address newRecipient)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        protocolFeeRecipient = newRecipient;
    }

    // ── UUPS ─────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}
}
