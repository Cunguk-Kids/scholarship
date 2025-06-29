// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/ScholarshipApplicantManagement.sol";
import "../contracts/ScholarshipBatchManagement.sol";
import "../contracts/ScholarshipDonaterNFT.sol";
import "../contracts/ScholarshipManager.sol";
import "../contracts/ScholarshipMilestoneManagment.sol";
import "../contracts/ScholarshipNFTMintingManager.sol";
import "../contracts/ScholarshipStorageManagement.sol";
import "../contracts/ScholarshipStruct.sol";

contract ScholarshipManagerTest is Test {
    ScholarshipManager public scholarshipManager;
    ScholarshipDonaterNFT public donaterNFT;

    address public owner = address(1);
    address public applicant1 = address(2);
    address public applicant2 = address(3);
    address public donor1 = address(4);
    address public donor2 = address(5);

    uint256[] public milestones = [0.1 ether, 0.2 ether, 0.3 ether];
    uint256 public constant QUORUM = 2;

    event ApplicantApplied(address indexed applicantAddress);
    event Voted(address voter, address applicant);
    event AddMilestone(uint indexed id, uint price, address applicant);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy NFT contract
        donaterNFT = new ScholarshipDonaterNFT();

        // Deploy main contract
        scholarshipManager = new ScholarshipManager(address(donaterNFT));

        // Set scholarship manager as owner of NFT contract
        donaterNFT.transferOwnership(address(scholarshipManager));

        vm.stopPrank();

        // Fund test accounts
        vm.deal(donor1, 10 ether);
        vm.deal(donor2, 10 ether);
        vm.deal(applicant1, 1 ether);
        vm.deal(applicant2, 1 ether);
    }

    // Test initial state
    function testInitialState() public view {
        assertEq(
            uint(scholarshipManager.appStatus()),
            uint(ScholarshipStatus.Pending)
        );
        assertEq(scholarshipManager.appBatch(), 0);
        assertEq(scholarshipManager.stackedToken(), 0);
    }

    // Test starting application
    function testStartApplication() public {
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        assertEq(
            uint(scholarshipManager.appStatus()),
            uint(ScholarshipStatus.OpenForApplications)
        );
        assertEq(scholarshipManager.appBatch(), 1);
    }

    function testStartApplicationOnlyOwner() public {
        vm.prank(applicant1);
        vm.expectRevert();
        scholarshipManager.startApplication(QUORUM);
    }

    // Test applicant application
    function testApplyApplicant() public {
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        vm.expectEmit(true, false, false, false);
        emit ApplicantApplied(applicant1);

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        Applicant memory applicant = scholarshipManager.getApplicant(
            applicant1
        );
        assertEq(applicant.applicantAddress, applicant1);
        assertEq(applicant.voteCount, 0);
        assertEq(scholarshipManager.getApplicantSize(), 1);
        assertEq(scholarshipManager.getNextMilestone(), 3);
    }

    function testApplyApplicantOnlyWhenOpen() public {
        vm.prank(applicant1);
        vm.expectRevert();
        scholarshipManager.applyApplicant(milestones);
    }

    function testApplyApplicantCannotApplyTwice() public {
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        vm.startPrank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        vm.expectRevert(ScholarshipApplicantManagement.AlreadyApply.selector);
        scholarshipManager.applyApplicant(milestones);
        vm.stopPrank();
    }

    function testApplyApplicantEmptyMilestones() public {
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        uint256[] memory emptyMilestones;
        vm.prank(applicant1);
        vm.expectRevert(
            ScholarshipMilestoneManagement.ArrayCannotEmpty.selector
        );
        scholarshipManager.applyApplicant(emptyMilestones);
    }

    // Test donations
    function testDonate() public {
        uint256 donationAmount = 0.1 ether;

        vm.prank(donor1);
        scholarshipManager.donate{value: donationAmount}();

        assertEq(
            scholarshipManager.stackedToken(),
            donationAmount - scholarshipManager.TRANSACTION_FEE()
        );
        assertEq(donaterNFT.balanceOf(donor1), 1);
        assertEq(donaterNFT.ownerOf(0), donor1);
    }

    function testDonateMinimalAmount() public {
        uint256 lowAmount = 0.02 ether;

        vm.prank(donor1);
        vm.expectRevert(ScholarshipManager.NotInMinimalAmount.selector);
        scholarshipManager.donate{value: lowAmount}();
    }

    function testDonateNFTRarityMapping() public {
        // Test Common rarity (0.1 ether)
        vm.prank(donor1);
        scholarshipManager.donate{value: 0.1 ether}();

        // Test Rare rarity (0.5 ether)
        vm.prank(donor2);
        scholarshipManager.donate{value: 0.5 ether}();

        assertEq(donaterNFT.balanceOf(donor1), 1);
        assertEq(donaterNFT.balanceOf(donor2), 1);
    }

    // Test voting
    function testVote() public {
        // Setup: start application and add applicant
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        // Vote
        vm.expectEmit(true, true, false, false);
        emit Voted(donor1, applicant1);

        vm.prank(donor1);
        scholarshipManager.vote(applicant1);

        Applicant memory applicant = scholarshipManager.getApplicant(
            applicant1
        );
        assertEq(applicant.voteCount, 1);
        assertTrue(scholarshipManager.getIsAlreadyVote(donor1));
    }

    function testVoteInvalidApplicant() public {
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        vm.prank(donor1);
        vm.expectRevert(
            ScholarshipApplicantManagement.OnlyValidApplicant.selector
        );
        scholarshipManager.vote(applicant1);
    }

    function testVoteCannotVoteTwice() public {
        // Setup
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        vm.startPrank(donor1);
        scholarshipManager.vote(applicant1);

        vm.expectRevert(ScholarshipApplicantManagement.AlreadyVote.selector);
        scholarshipManager.vote(applicant1);
        vm.stopPrank();
    }

    // Test milestone withdrawal
    function testWithdrawMilestone() public {
        // Setup: start application, add applicant, get enough votes
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        // Get enough votes to meet quorum
        vm.prank(donor1);
        scholarshipManager.vote(applicant1);

        vm.prank(donor2);
        scholarshipManager.vote(applicant1);

        // Donate to fund the contract
        vm.prank(donor1);
        scholarshipManager.donate{value: 1 ether}();

        // Withdraw milestone
        uint256 applicantBalanceBefore = applicant1.balance;
        uint256 batch = scholarshipManager.appBatch();

        vm.prank(applicant1);
        scholarshipManager.withrawMilestone(
            batch,
            1,
            "First milestone completed"
        );

        assertEq(applicant1.balance, applicantBalanceBefore + 0.1 ether);

        ScholarshipMilestoneManagement.Milestone
            memory milestone = scholarshipManager.getMilestone(1);
        assertTrue(milestone.isWithdrawed);
        assertEq(milestone.metadata, "First milestone completed");
    }

    function testWithdrawMilestoneNotInQuorum() public {
        // Setup without enough votes
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        // Only one vote (need 2 for quorum)
        vm.prank(donor1);
        scholarshipManager.vote(applicant1);

        vm.prank(donor1);
        scholarshipManager.donate{value: 1 ether}();

        uint256 batch = scholarshipManager.appBatch();

        vm.prank(applicant1);
        vm.expectRevert(ScholarshipManager.CannotWithdrawNotInQuorum.selector);
        scholarshipManager.withrawMilestone(
            batch,
            1,
            "First milestone completed"
        );
    }

    function testWithdrawMilestoneOnlyApplicant() public {
        // Setup with enough votes
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        vm.prank(donor1);
        scholarshipManager.vote(applicant1);

        vm.prank(donor2);
        scholarshipManager.vote(applicant1);

        vm.prank(donor1);
        scholarshipManager.donate{value: 1 ether}();

        uint256 batch = scholarshipManager.appBatch();

        // Try to withdraw from different address
        vm.prank(applicant2);
        vm.expectRevert(
            ScholarshipMilestoneManagement.OnlyApplicantCanWithdraw.selector
        );
        scholarshipManager.withrawMilestone(
            batch,
            1,
            "First milestone completed"
        );
    }

    function testWithdrawMilestoneOnlyOnce() public {
        // Setup
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        vm.prank(donor1);
        scholarshipManager.vote(applicant1);

        vm.prank(donor2);
        scholarshipManager.vote(applicant1);

        vm.prank(donor1);
        scholarshipManager.donate{value: 1 ether}();

        uint256 batch = scholarshipManager.appBatch();

        vm.prank(applicant1);
        scholarshipManager.withrawMilestone(
            batch,
            1,
            "First milestone completed"
        );

        // Try to withdraw again
        vm.prank(applicant1);
        vm.expectRevert(
            ScholarshipMilestoneManagement.WithdrawMilestoneOnlyOnce.selector
        );
        scholarshipManager.withrawMilestone(
            batch,
            1,
            "First milestone completed again"
        );
    }

    // Test milestone getter
    function testGetMilestone() public {
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        ScholarshipMilestoneManagement.Milestone
            memory milestone = scholarshipManager.getMilestone(1);
        assertEq(milestone.price, 0.1 ether);
        assertEq(milestone.applicant, applicant1);
        assertFalse(milestone.isWithdrawed);
        assertEq(milestone.metadata, "");
    }

    // Test multiple batches
    function testMultipleBatches() public {
        // First batch
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        assertEq(scholarshipManager.appBatch(), 1);

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        // Simulate completing first batch and starting second
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        assertEq(scholarshipManager.appBatch(), 2);
        assertEq(scholarshipManager.getApplicantSize(), 0); // New batch, no applicants yet
        assertEq(scholarshipManager.getNextMilestone(), 0); // New batch, no milestones yet
    }

    // Integration test: Full workflow
    function testFullWorkflow() public {
        // 1. Start application
        vm.prank(owner);
        scholarshipManager.startApplication(QUORUM);

        // 2. Multiple applicants apply
        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones);

        uint256[] memory milestones2 = new uint256[](2);
        milestones2[0] = 0.15 ether;
        milestones2[1] = 0.25 ether;

        vm.prank(applicant2);
        scholarshipManager.applyApplicant(milestones2);

        assertEq(scholarshipManager.getApplicantSize(), 2);

        // 3. Donors donate and vote
        vm.prank(donor1);
        scholarshipManager.donate{value: 1 ether}();

        vm.prank(donor2);
        scholarshipManager.donate{value: 0.5 ether}();

        vm.prank(donor1);
        scholarshipManager.vote(applicant1);

        vm.prank(donor2);
        scholarshipManager.vote(applicant1);

        // 4. Applicant1 reaches quorum and withdraws milestones
        uint256 batch = scholarshipManager.appBatch();

        vm.prank(applicant1);
        scholarshipManager.withrawMilestone(
            batch,
            1,
            "Completed first milestone"
        );

        vm.prank(applicant1);
        scholarshipManager.withrawMilestone(
            batch,
            2,
            "Completed second milestone"
        );

        // 5. Verify final state
        Applicant memory finalApplicant = scholarshipManager.getApplicant(
            applicant1
        );
        assertEq(finalApplicant.voteCount, 2);

        assertTrue(scholarshipManager.getMilestone(1).isWithdrawed);
        assertTrue(scholarshipManager.getMilestone(2).isWithdrawed);

        assertEq(donaterNFT.balanceOf(donor1), 1);
        assertEq(donaterNFT.balanceOf(donor2), 1);
    }
}
