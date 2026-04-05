// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {ScholarshipTypes} from "../libraries/ScholarshipTypes.sol";

interface IScholarshipCoreAdmin {
    function adminForceStatus(uint256 programId, ScholarshipTypes.ProgramStatus newStatus) external;
    function adminUpdateDates(uint256 programId, uint256 appStart, uint256 appEnd, uint256 voteStart, uint256 voteEnd) external;
    function setProtocolConfig(ScholarshipTypes.ProtocolConfig calldata c) external;
    function extendApplicationDeadline(uint256 programId, uint256 newEnd) external;
    function extendVotingDeadline(uint256 programId, uint256 newEnd) external;
    function getProgram(uint256 programId) external view returns (ScholarshipTypes.Program memory);
}

/**
 * @title  ScholarshipAdmin v5
 * @notice Split contract for administrative and governance functions.
 *         Maintains EIP-170 compliance for ScholarshipCore by offloading
 *         infrequently used management logic.
 */
contract ScholarshipAdmin is Initializable, AccessControlUpgradeable, UUPSUpgradeable {

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    IScholarshipCoreAdmin public core;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address admin, address _core) external initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        core = IScholarshipCoreAdmin(_core);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}

    // ── Admin Wrappers ───────────────────────────────────────────────────────

    function setProtocolConfig(ScholarshipTypes.ProtocolConfig calldata c) external onlyRole(DEFAULT_ADMIN_ROLE) {
        core.setProtocolConfig(c);
    }

    function adminForceStatus(uint256 programId, ScholarshipTypes.ProgramStatus newStatus) external onlyRole(DEFAULT_ADMIN_ROLE) {
        core.adminForceStatus(programId, newStatus);
    }

    function adminUpdateDates(
        uint256 programId,
        uint256 appStart,
        uint256 appEnd,
        uint256 voteStart,
        uint256 voteEnd
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        core.adminUpdateDates(programId, appStart, appEnd, voteStart, voteEnd);
    }

    // ── Extension Wrappers (Initiator only) ──────────────────────────────────
    // Note: ScholarshipCore will perform the onlyInitiator check.

    function extendApplicationDeadline(uint256 programId, uint256 newEnd) external {
        core.extendApplicationDeadline(programId, newEnd);
    }

    function extendVotingDeadline(uint256 programId, uint256 newEnd) external {
        core.extendVotingDeadline(programId, newEnd);
    }
}
