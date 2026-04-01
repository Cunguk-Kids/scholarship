// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title  ScholarshipReputation
 * @author Scholarship Protocol
 * @notice Soulbound reputation token (REP) for voters.
 *
 * @dev    Non-transferable by design — reputation cannot be bought or sold.
 *         Earned by successfully curating scholars; lost by backing fraudsters.
 *
 *         REPUTATION MECHANICS
 *         ┌──────────────────────────────────────────────────────────────┐
 *         │  +10  REP  per milestone completed by a scholar you backed   │
 *         │  +50  REP  scholar fully completes the program               │
 *         │  -50  REP  scholar slashed — LIGHT_FRAUD                     │
 *         │  -100 REP  scholar slashed — MILESTONE_FRAUD                 │
 *         │  -200 REP  scholar slashed — HEAVY_FRAUD                     │
 *         └──────────────────────────────────────────────────────────────┘
 *
 *         VOTING POWER LOCK
 *         When the scholar a voter backed enters a BH dispute, that voter's
 *         voting power is locked until the dispute resolves.  This ensures
 *         voters have skin-in-the-game beyond just their confidence stake.
 *
 * UPGRADEABILITY
 *   UUPS — only accounts with UPGRADER_ROLE may authorise an upgrade.
 *
 * ROLES
 *   DEFAULT_ADMIN_ROLE  – governance / multisig
 *   UPGRADER_ROLE       – proxy admin
 *   MINTER_ROLE         – ScholarshipCore (rewards)
 *   BURNER_ROLE         – ScholarshipCore (penalties)
 *   LOCKER_ROLE         – ScholarshipCore (dispute lock)
 */
contract ScholarshipReputation is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable
{
    // ── Roles ────────────────────────────────────────────────────────────────

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MINTER_ROLE   = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE   = keccak256("BURNER_ROLE");
    bytes32 public constant LOCKER_ROLE   = keccak256("LOCKER_ROLE");

    // ── Storage ──────────────────────────────────────────────────────────────

    /// @dev REP balances.  Non-transferable so we manage them directly.
    mapping(address => uint256) private _balances;

    /// @dev Timestamp until which a voter cannot cast votes in new programs.
    ///      0 means unlocked.  Auto-unlocks when block.timestamp exceeds value.
    mapping(address => uint256) public votingPowerLockedUntil;

    uint256 public totalSupply;

    /// @dev Contract version — used for upgrade path tracking.
    string public constant VERSION = "4.0.0";

    // ── Events ───────────────────────────────────────────────────────────────

    event ReputationMinted(address indexed to,   uint256 amount, string reason);
    event ReputationBurned(address indexed from, uint256 amount, string reason);
    event VotingPowerLocked(address indexed voter, uint256 lockedUntil);

    // ── Errors ───────────────────────────────────────────────────────────────

    error SoulboundCannotTransfer();

    // ── Constructor / Initializer ────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /**
     * @notice Initialises the proxy.
     * @param admin Initial admin (multisig recommended for production).
     */
    function initialize(address admin) external initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE,      admin);
    }

    // ── Soulbound enforcement ────────────────────────────────────────────────

    /**
     * @dev Blocks any call that looks like a normal ERC-20 transfer.
     *      Only mint-from-zero and burn-to-zero are permitted.
     *      Called before every balance mutation.
     */
    function _assertNotTransfer(address from, address to) private pure {
        if (from != address(0) && to != address(0)) revert SoulboundCannotTransfer();
    }

    // ── Core mutations (role-gated) ──────────────────────────────────────────

    /**
     * @notice Award REP to a voter.
     * @param to     Voter wallet.
     * @param amount REP units to credit.
     * @param reason Human-readable audit label (e.g. "milestone_completed").
     */
    function mint(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyRole(MINTER_ROLE) {
        _assertNotTransfer(address(0), to);
        _balances[to] += amount;
        totalSupply   += amount;
        emit ReputationMinted(to, amount, reason);
    }

    /**
     * @notice Deduct REP from a voter.
     *         Gracefully saturates at zero — never reverts on underflow.
     * @param from   Voter wallet.
     * @param amount REP units to remove.
     * @param reason Human-readable audit label (e.g. "scholar_slashed").
     */
    function burn(
        address from,
        uint256 amount,
        string calldata reason
    ) external onlyRole(BURNER_ROLE) {
        _assertNotTransfer(from, address(0));
        uint256 current = _balances[from];
        uint256 toBurn  = current >= amount ? amount : current;
        _balances[from] -= toBurn;
        totalSupply     -= toBurn;
        emit ReputationBurned(from, toBurn, reason);
    }

    /**
     * @notice Prevent a voter from casting votes until `lockUntil`.
     *         Called when a scholar the voter backed enters a dispute.
     * @param voter     Voter wallet to lock.
     * @param lockUntil Unix timestamp at which the lock expires.
     */
    function lockVotingPower(
        address voter,
        uint256 lockUntil
    ) external onlyRole(LOCKER_ROLE) {
        // Only extend — never shorten an existing lock
        if (lockUntil > votingPowerLockedUntil[voter]) {
            votingPowerLockedUntil[voter] = lockUntil;
            emit VotingPowerLocked(voter, lockUntil);
        }
    }

    // ── Views ────────────────────────────────────────────────────────────────

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Returns true if the voter's lock timestamp is still in the future.
     */
    function isVotingPowerLocked(address voter) external view returns (bool) {
        return block.timestamp < votingPowerLockedUntil[voter];
    }

    // ── UUPS ─────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}
}
