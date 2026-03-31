// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title ScholarshipReputation
 * @dev Soulbound Token (SBT) for tracking voter reputation.
 *
 *  Non-transferable by design — reputation cannot be bought or sold.
 *  Earned by successfully curating scholars. Lost by backing fraudsters.
 *
 *  REPUTATION MECHANICS:
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │ +50 REP  → Backed a scholar who completed all milestones    │
 *  │ +10 REP  → Backed a scholar who completed one milestone     │
 *  │ -50 REP  → Backed a scholar who was slashed (LIGHT_FRAUD)   │
 *  │ -100 REP → Backed a scholar who was slashed (MILESTONE_FRAUD│
 *  │ -200 REP → Backed a scholar who was slashed (HEAVY_FRAUD)   │
 *  └─────────────────────────────────────────────────────────────┘
 *
 *  VOTING POWER LOCK:
 *  When a scholar is disputed, all voters who backed that scholar
 *  have their voting power locked (cannot vote in new programs)
 *  until the dispute is resolved. This creates accountability.
 */
contract ScholarshipReputation is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable
{
    bytes32 public constant UPGRADER_ROLE  = keccak256("UPGRADER_ROLE");
    bytes32 public constant MINTER_ROLE    = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE    = keccak256("BURNER_ROLE");
    bytes32 public constant LOCKER_ROLE    = keccak256("LOCKER_ROLE");

    // ── Storage ────────────────────────────────────────────────────────────

    mapping(address => uint256) private _balances;
    mapping(address => uint256) public  votingPowerLockedUntil;

    uint256 public totalSupply;

    // ── Events ─────────────────────────────────────────────────────────────

    event ReputationMinted(address indexed to, uint256 amount, string reason);
    event ReputationBurned(address indexed from, uint256 amount, string reason);
    event VotingPowerLocked(address indexed voter, uint256 lockedUntil);
    event VotingPowerUnlocked(address indexed voter);

    // ── Errors ─────────────────────────────────────────────────────────────

    error SoulboundCannotTransfer();
    error VotingPowerCurrentlyLocked(uint256 lockedUntil);

    // ── Initializer ────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address admin) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE,      admin);
    }

    // ── Soulbound enforcement ───────────────────────────────────────────────

    /**
     * @dev Block all transfers — reputation is non-transferable.
     *      Only mint (from 0x0) and burn (to 0x0) are allowed.
     */
    function _beforeTokenTransfer(
        address from,
        address to
    ) internal pure {
        if (from != address(0) && to != address(0)) {
            revert SoulboundCannotTransfer();
        }
    }

    // ── Core functions ──────────────────────────────────────────────────────

    function mint(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyRole(MINTER_ROLE) {
        _beforeTokenTransfer(address(0), to);
        _balances[to] += amount;
        totalSupply    += amount;
        emit ReputationMinted(to, amount, reason);
    }

    function burn(
        address from,
        uint256 amount,
        string calldata reason
    ) external onlyRole(BURNER_ROLE) {
        _beforeTokenTransfer(from, address(0));
        uint256 current = _balances[from];
        // Burn minimum of amount or full balance — never underflow
        uint256 toBurn = current >= amount ? amount : current;
        _balances[from] -= toBurn;
        totalSupply      -= toBurn;
        emit ReputationBurned(from, toBurn, reason);
    }

    /**
     * @dev Lock a voter's ability to vote in new programs.
     *      Called when a scholar they backed enters a dispute.
     *      Voting power unlocks automatically when lockUntil passes.
     */
    function lockVotingPower(
        address voter,
        uint256 lockUntil
    ) external onlyRole(LOCKER_ROLE) {
        votingPowerLockedUntil[voter] = lockUntil;
        emit VotingPowerLocked(voter, lockUntil);
    }

    function isVotingPowerLocked(address voter) external view returns (bool) {
        return block.timestamp < votingPowerLockedUntil[voter];
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    // ── UUPS ───────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address)
        internal override onlyRole(UPGRADER_ROLE) {}
}
