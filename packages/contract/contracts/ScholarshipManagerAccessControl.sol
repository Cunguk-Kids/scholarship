// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract ScholarshipManagerAccessControl is AccessControlUpgradeable {
    bytes32 public constant OPEN_ROLE = keccak256("OPEN_ROLE");
    bytes32 public constant OPEN_VOTE_ROLE = keccak256("OPEN_VOTE_ROLE");
    bytes32 public constant CLOSE_ROLE = keccak256("CLOSE_ROLE");
    bytes32 public constant OPEN_DONATION_ROLE =
        keccak256("OPEN_DONATION_ROLE");

    error OnlyOpenRole();
    error OnlyVoteRole();
    error OnlyCloseRole();
    error OnlyOpenDonationRole();

    function __ScholarshipManagerAccessControl_init()
        internal
        onlyInitializing
    {
        __AccessControl_init();
        _grantRole(OPEN_ROLE, msg.sender);
        _grantRole(OPEN_VOTE_ROLE, msg.sender);
        _grantRole(CLOSE_ROLE, msg.sender);
        _grantRole(OPEN_DONATION_ROLE, msg.sender);
    }
}
