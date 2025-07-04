// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../contracts/ScholarshipManager.sol";
import "../../contracts/ScholarshipProgram.sol";
import "forge-std/Test.sol";
import "./UserHelper.sol";

library ProgramHelper {
    function createProgram(
        ScholarshipManager manager,
        address creator,
        string memory cid,
        uint256 target,
        Vm vmInstance
    ) internal {
        vmInstance.prank(creator);
        manager.createProgram(
            cid,
            target,
            block.timestamp,
            block.timestamp + 1 days
        );
    }

    function grantAllRoles(
        ScholarshipProgram program,
        address admin,
        Vm vmInstance
    ) internal {
        (bytes32 openRole, bytes32 voteRole, bytes32 donationRole) = UserHelper
            .getRoles();
        vmInstance.startPrank(admin);
        program.grantRole(openRole, admin);
        program.grantRole(voteRole, admin);
        program.grantRole(donationRole, admin);
        vmInstance.stopPrank();
    }
}
