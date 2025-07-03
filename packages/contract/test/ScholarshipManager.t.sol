// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/ScholarshipManager.sol";
import "../contracts/ScholarshipProgram.sol";
import "../contracts/ScholarshipStruct.sol";

contract ScholarshipManagerTest is Test {
    ScholarshipManager public manager;
    ScholarshipProgram public logic;

    address internal user1 = address(0x1);
    address internal user2 = address(0x2);
    address internal donator = address(0x3);

    function setUp() public {
        logic = new ScholarshipProgram();
        manager = new ScholarshipManager(address(logic));
    }

    function testCreateProgram() public {
        vm.prank(user1);
        manager.createProgram(
            "QmMetaCID",
            2,
            block.timestamp,
            block.timestamp + 10 days
        );

        ScholarshipProgramDetails memory details = manager.getProgramDetails(0);

        assertEq(details.initiatorAddress, user1);
        assertEq(details.programMetadataCID, "QmMetaCID");
        assertEq(details.targetApplicant, 2);
    }

    function testGetAllPrograms() public {
        vm.prank(user1);
        manager.createProgram(
            "CID1",
            1,
            block.timestamp,
            block.timestamp + 1 days
        );

        vm.prank(user2);
        manager.createProgram(
            "CID2",
            2,
            block.timestamp,
            block.timestamp + 1 days
        );

        ScholarshipProgramDetails[] memory list = manager.getAllPrograms();

        assertEq(list.length, 2);
        assertEq(list[0].initiatorAddress, user1);
        assertEq(list[1].initiatorAddress, user2);
    }

    function testApplyToProgram() public {
        vm.prank(user1);
        manager.createProgram(
            "MetaCID",
            2,
            block.timestamp,
            block.timestamp + 1 days
        );

        ScholarshipProgramDetails memory details = manager.getProgramDetails(0);
        ScholarshipProgram program = ScholarshipProgram(
            details.programContractAddress
        );

        bytes32 OPEN_ROLE = keccak256("OPEN_ROLE");
        vm.prank(address(this));
        program.grantRole(OPEN_ROLE, address(this));

        vm.prank(address(this));
        program.startApplication(0);

        // Fixed: Create empty uint256 array properly
        uint256[] memory emptyArray = new uint256[](0);
        vm.prank(user2);
        manager.applyToProgram(0, emptyArray);

        address[] memory applicants = manager.getApplicants(0);
        assertEq(applicants.length, 1);
        assertEq(applicants[0], user2);
    }

    function testDonate() public {
        vm.prank(user1);
        manager.createProgram(
            "MetaCID",
            1,
            block.timestamp,
            block.timestamp + 1 days
        );

        ScholarshipProgramDetails memory details = manager.getProgramDetails(0);
        ScholarshipProgram program = ScholarshipProgram(
            details.programContractAddress
        );

        // Setup roles
        bytes32 OPEN_ROLE = keccak256("OPEN_ROLE");
        bytes32 OPEN_VOTE_ROLE = keccak256("OPEN_VOTE_ROLE");
        bytes32 OPEN_DONATION_ROLE = keccak256("OPEN_DONATION_ROLE");

        vm.startPrank(address(this));
        program.grantRole(OPEN_ROLE, address(this));
        program.grantRole(OPEN_VOTE_ROLE, address(this));
        program.grantRole(OPEN_DONATION_ROLE, address(this));
        program.startApplication(0);
        vm.stopPrank();

        // Fixed: Create empty uint256 array properly
        uint256[] memory emptyArray = new uint256[](0);
        vm.prank(user2);
        manager.applyToProgram(0, emptyArray);

        vm.startPrank(address(this));
        program.openVote();
        program.openDonation();
        vm.stopPrank();

        vm.deal(donator, 1 ether);
        vm.prank(donator);
        manager.donateToProgram{value: 0.1 ether}(0);

        address[] memory donators = manager.getDonators(0);
        assertEq(donators.length, 1);
        assertEq(donators[0], donator);
    }
}
