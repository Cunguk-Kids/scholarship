// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/ScholarshipManager.sol";
import "../contracts/ScholarshipProgram.sol";
import "../contracts/ScholarshipStruct.sol";
import "./helpers/ProgramHelper.sol";
import "./helpers/UserHelper.sol";
import "./helpers/MilestoneHelper.sol";

contract ScholarshipManagerTest is Test {
    using ProgramHelper for *;

    ScholarshipManager public manager;
    ScholarshipProgram public logic;

    address user1;
    address user2;
    address user3;
    address donator;
    address voter;

    function setUp() public {
        logic = new ScholarshipProgram();
        manager = new ScholarshipManager(
            address(logic),
            address(0),
            address(0)
        );

        (user1, user2, user3, donator, voter) = UserHelper.getUsers();
    }

    // create program
    function testCreateProgram() public {
        ProgramHelper.createProgram(manager, user1, "QmMetaCID", 2, vm);
        ScholarshipProgramDetails memory details = manager.getProgramDetails(0);
        assertEq(details.initiatorAddress, user1);
        assertEq(details.programMetadataCID, "QmMetaCID");
        assertEq(details.targetApplicant, 2);
    }

    // apply program
    function testApplyToProgram() public {
        ProgramHelper.createProgram(manager, user1, "MetaCID", 2, vm);

        ScholarshipProgramDetails memory details = manager.getProgramDetails(0);
        ScholarshipProgram program = ScholarshipProgram(
            payable(details.programContractAddress)
        );

        // ProgramHelper.grantAllRoles(program, user1, vm);

        vm.prank(user1);
        program.startApplication(0);

        MilestoneInput[] memory milestones = MilestoneHelper.generateMilestones(
            5
        );

        vm.prank(user2);
        manager.applyToProgram(0, milestones);

        address[] memory applicants = manager.getApplicants(0);
        assertEq(applicants.length, 1);
        assertEq(applicants[0], user2);
    }

    // get all program
    function testGetAllPrograms() public {
        ProgramHelper.createProgram(manager, user1, "MetaCID", 1, vm);

        ProgramHelper.createProgram(manager, user2, "MetaCID", 1, vm);

        ScholarshipProgramDetails[] memory list = manager.getAllPrograms();
        assertEq(list.length, 2);
        assertEq(list[0].initiatorAddress, user1);
        assertEq(list[1].initiatorAddress, user2);
    }

    // donate program
    function testDonate() public {
        ProgramHelper.createProgram(manager, user1, "MetaCID", 1, vm);

        ScholarshipProgramDetails memory details = manager.getProgramDetails(0);
        ScholarshipProgram program = ScholarshipProgram(
            payable(details.programContractAddress)
        );

        // ProgramHelper.grantAllRoles(program, user1, vm);

        vm.prank(user1);
        program.startApplication(0);

        MilestoneInput[] memory milestones = MilestoneHelper.generateMilestones(
            5
        );

        vm.prank(user2);
        manager.applyToProgram(0, milestones);

        vm.prank(user3);
        manager.applyToProgram(0, milestones);

        console.log("user3");
        vm.prank(user1);
        program.openDonation();

        vm.deal(donator, 1 ether);
        vm.prank(donator);
        manager.donateToProgram{value: 0.1 ether}(0);

        uint256 balance = manager.getContractBalance(0);
        assertEq(balance, 0.1 ether);

        vm.prank(user1);
        program.closeDonation();

        address[] memory donatorsArr = manager.getDonators(0);
        assertEq(donatorsArr.length, 1);
        assertEq(donatorsArr[0], donator);
    }

    // vote
    function testVote() public {
        ProgramHelper.createProgram(manager, user1, "MetaCID", 1, vm);

        console.log(user1, "-----1-----");
        ScholarshipProgramDetails memory details = manager.getProgramDetails(0);
        ScholarshipProgram program = ScholarshipProgram(
            payable(details.programContractAddress)
        );

        vm.prank(user1);
        program.startApplication(0);

        MilestoneInput[] memory milestones = MilestoneHelper.generateMilestones(
            5
        );

        vm.prank(user2);
        manager.applyToProgram(0, milestones);

        vm.prank(user3);
        manager.applyToProgram(0, milestones);

        console.log("user3", address(user1), address(user2), address(this));
        vm.prank(user1);
        program.openDonation();

        vm.deal(donator, 100 ether);
        vm.prank(donator);
        manager.donateToProgram{value: 10 ether}(0);
        uint256 balance = manager.getContractBalance(0);
        assertEq(balance, 10 ether);

        vm.prank(user1);
        program.openVote();
        console.log("-----done open vote-----");

        vm.prank(voter);
        program.vote(voter, user2);
        console.log("-----done vote-----");

        address[] memory applicantArr = manager.getApplicants(0);
        assertEq(applicantArr.length, 2);
        assertEq(applicantArr[0], user2);
    }
    // withraw milestone

    //  vm.startPrank(user1);
    // program.openVote();
    // console.log("openVote done");
    // vm.stopPrank();

    // vm.startPrank(voter);
    // program.voteApplicant();
    // console.log("voteApplicant done");
    //
}
