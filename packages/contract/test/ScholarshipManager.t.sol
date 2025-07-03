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
    address internal user3 = address(0x3);
    address internal donator = address(0x4);
    address internal voter = address(0x5);

    // role hash
    bytes32 internal OPEN_ROLE = keccak256("OPEN_ROLE");
    bytes32 internal OPEN_VOTE_ROLE = keccak256("OPEN_VOTE_ROLE");
    bytes32 internal OPEN_DONATION_ROLE = keccak256("OPEN_DONATION_ROLE");

    function setUp() public {
        logic = new ScholarshipProgram();
        manager = new ScholarshipManager(address(logic));
    }

    function grantAllRoles(ScholarshipProgram program, address to) internal {
        vm.startPrank(user1);
        program.grantRole(OPEN_ROLE, to);
        program.grantRole(OPEN_VOTE_ROLE, to);
        program.grantRole(OPEN_DONATION_ROLE, to);
        vm.stopPrank();
    }

    // CREATE PROGRAM
    function testCreateProgram() public {
        vm.prank(user1);
        console.log("a", address(user1));
        manager.createProgram(
            "QmMetaCID",
            2,
            block.timestamp,
            block.timestamp + 10 days
        );

        console.log("b", address(user1));
        ScholarshipProgramDetails memory details = manager.getProgramDetails(0);
        console.log("initiatorAddress:", address(details.initiatorAddress));
        console.log("user1:", address(user1));
        assertEq(details.initiatorAddress, user1);
        assertEq(details.programMetadataCID, "QmMetaCID");
        assertEq(details.targetApplicant, 2);
    }

    // GET ALL PROGRAMS
    function testGetAllPrograms() public {
        vm.prank(user1);
        console.log("user1 program start");

        manager.createProgram(
            "CID1",
            1,
            block.timestamp,
            block.timestamp + 1 days
        );
        console.log("user1 program end");

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

    // APPLY PROGRAM
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
            payable(details.programContractAddress)
        );

        // Grant OPEN_ROLE ke address(this) dari user1 (karena user1 punya admin role)
        grantAllRoles(program, address(this));
        console.log(address(user2), address(user1));
        vm.prank(address(this));
        program.startApplication(0);
        console.log("-----started-----");
        vm.prank(user2);
        MilestoneInput[] memory milestones = new MilestoneInput[](1);

        // Milestone custom
        milestones[0] = MilestoneInput({
            price: 0.5 ether,
            metadata: "QmABCDEF1234567890xyz...",
            templateId: 0,
            mType: MilestoneType.CUSTOM
        });
        manager.applyToProgram(0, milestones);

        address[] memory applicants = manager.getApplicants(0);
        assertEq(applicants.length, 1);
        assertEq(applicants[0], user2);
    }

    // donate
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
            payable(details.programContractAddress)
        );

        // Grant semua role yang dibutuhkan via user1
        grantAllRoles(program, address(this));

        vm.prank(user1);
        program.startApplication(0);
        // Milestone custom
        MilestoneInput[] memory milestones = new MilestoneInput[](1);
        milestones[0] = MilestoneInput({
            price: 0.5 ether,
            metadata: "QmABCDEF1234567890xyz...",
            templateId: 0,
            mType: MilestoneType.CUSTOM
        });

        vm.prank(user2);
        manager.applyToProgram(0, milestones);
        console.log("user 2 done");

        vm.prank(user3);
        manager.applyToProgram(0, milestones);
        console.log("user 3 done");

        program.openDonation();
        console.log("openDonation done");

        vm.deal(donator, 1 ether);
        vm.prank(donator);
        manager.donateToProgram{value: 0.1 ether}(0);
        console.log("donateToProgram done");

        uint256 balance = manager.getContractBalance(0);
        console.log(balance);

        program.closeDonation();
        console.log("closeDonation done");

        address[] memory donatorsArr = manager.getDonators(0);
        assertEq(0.1 ether, manager.getContractBalance(0));
        assertEq(donatorsArr.length, 1);
        assertEq(donatorsArr[0], donator);
    }

    //     vm.startPrank(user1);
    // program.openVote();
    // console.log("openVote done");
    // vm.stopPrank();

    // vm.startPrank(voter);
    // program.voteApplicant();
    // console.log("voteApplicant done");
    // vm.stopPrank();
}
