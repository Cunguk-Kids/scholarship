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
    ScholarshipStudentNFT public applicantNFT;

    address public owner;
    address public donor1;
    address public donor2;
    address public applicant1;
    address public applicant2;
    address public applicant3;
    address public voter1;
    address public voter2;

    uint256 public constant MINIMAL_DONATION = 0.03 ether;
    uint256 public constant TRANSACTION_FEE = 0.01 ether;

    event ApplicantApplied(address indexed applicantAddress, uint256 batchId);
    event Voted(address voter, address applicant, uint256 batchId);
    event BatchStarted(
        uint256 batchId,
        uint256 quromVote,
        uint256 applicantTarget
    );
    event VotingStarted(uint256 batchId);
    event VotingCompleted(uint256 batchId);
    event Donated(address indexed donater, uint256 batchId, uint value);
    event MilestoneWithdrawed(
        uint256 indexed id,
        uint256 indexed batch,
        address user
    );

    function setUp() public {
        owner = address(this);
        donor1 = makeAddr("donor1");
        donor2 = makeAddr("donor2");
        applicant1 = makeAddr("applicant1");
        applicant2 = makeAddr("applicant2");
        applicant3 = makeAddr("applicant3");
        voter1 = makeAddr("voter1");
        voter2 = makeAddr("voter2");

        // Deploy NFT contract
        donaterNFT = new ScholarshipDonaterNFT();
        applicantNFT = new ScholarshipStudentNFT();

        // Deploy main contract
        scholarshipManager = new ScholarshipManager(
            address(donaterNFT),
            address(applicantNFT)
        );

        // Grant minting role to the scholarship manager
        donaterNFT.grantRole(
            donaterNFT.MINTER_ROLE(),
            address(scholarshipManager)
        );
        applicantNFT.grantRole(
            applicantNFT.MINTER_ROLE(),
            address(scholarshipManager)
        );

        // Fund test accounts
        vm.deal(donor1, 10 ether);
        vm.deal(donor2, 10 ether);
        vm.deal(applicant1, 1 ether);
        vm.deal(applicant2, 1 ether);
        vm.deal(applicant3, 1 ether);
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

    // Test donation functionality
    function testDonation() public {
        uint256 donationAmount = 0.5 ether;

        vm.prank(donor1);
        vm.expectEmit(true, false, false, true);
        emit Donated(donor1, 0, donationAmount);
        scholarshipManager.donate{value: donationAmount}("");

        assertEq(
            scholarshipManager.stackedToken(),
            donationAmount - TRANSACTION_FEE
        );
        assertEq(donaterNFT.balanceOf(donor1), 1);
    }

    function testDonationBelowMinimal() public {
        uint256 donationAmount = 0.02 ether; // Below minimal

        vm.prank(donor1);
        vm.expectRevert(ScholarshipManager.NotInMinimalAmount.selector);
        scholarshipManager.donate{value: donationAmount}("");
    }

    function testDonationOnlyInPendingStatus() public {
        // Start application phase
        scholarshipManager.startApplication(2, 2);

        vm.prank(donor1);
        vm.expectRevert(
            abi.encodeWithSelector(
                ScholarshipBatchManagement.OnlyInStatus.selector,
                ScholarshipStatus.Pending
            )
        );
        scholarshipManager.donate{value: 0.5 ether}("");
    }

    // Test batch management
    function testStartApplication() public {
        vm.expectEmit(false, false, false, true);
        emit BatchStarted(1, 2, 2);
        scholarshipManager.startApplication(2, 2);

        assertEq(
            uint(scholarshipManager.appStatus()),
            uint(ScholarshipStatus.OpenForApplications)
        );
        assertEq(scholarshipManager.appBatch(), 1);
    }

    function testStartApplicationOnlyOpenRole() public {
        vm.prank(donor1);
        vm.expectRevert();
        scholarshipManager.startApplication(2, 2);
    }

    // Test application functionality
    function testApplyApplicant() public {
        scholarshipManager.startApplication(2, 2);

        uint256[] memory milestones = new uint256[](2);
        milestones[0] = 0.1 ether;
        milestones[1] = 0.2 ether;

        vm.prank(applicant1);
        vm.expectEmit(true, false, false, true);
        emit ApplicantApplied(applicant1, 1);
        scholarshipManager.applyApplicant(milestones, "");

        assertEq(scholarshipManager.getApplicantSize(), 1);

        // Check applicant data
        Applicant memory aplc = scholarshipManager.getApplicant(applicant1);
        assertEq(aplc.applicantAddress, applicant1);
        assertEq(aplc.voteCount, 0);
    }

    function testApplyApplicantDuplicate() public {
        scholarshipManager.startApplication(2, 2);

        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        // Try to apply again
        vm.prank(applicant1);
        vm.expectRevert(ScholarshipApplicantManagement.AlreadyApply.selector);
        scholarshipManager.applyApplicant(milestones, "");
    }

    function testApplyWithEmptyMilestones() public {
        scholarshipManager.startApplication(2, 2);

        uint256[] memory milestones = new uint256[](0);

        vm.prank(applicant1);
        vm.expectRevert(
            ScholarshipMilestoneManagement.ArrayCannotEmpty.selector
        );
        scholarshipManager.applyApplicant(milestones, "");
    }

    // Test voting functionality
    function testOpenVote() public {
        scholarshipManager.startApplication(2, 2);

        // Add required number of applicants
        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        vm.prank(applicant2);
        scholarshipManager.applyApplicant(milestones, "");

        vm.expectEmit(false, false, false, true);
        emit VotingStarted(1);
        scholarshipManager.openVote();

        assertEq(
            uint(scholarshipManager.appStatus()),
            uint(ScholarshipStatus.VotingOpen)
        );
    }

    function testOpenVoteInsufficientApplicants() public {
        scholarshipManager.startApplication(2, 2);

        // Add only one applicant when two are required
        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        vm.expectRevert(ScholarshipManager.ApplicantNotEnough.selector);
        scholarshipManager.openVote();
    }

    function testVote() public {
        // Setup voting phase
        scholarshipManager.startApplication(2, 2);

        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        vm.prank(applicant2);
        scholarshipManager.applyApplicant(milestones, "");

        scholarshipManager.openVote();

        // Vote for applicant1
        vm.prank(voter1);
        vm.expectEmit(false, false, false, true);
        emit Voted(voter1, applicant1, 1);
        scholarshipManager.vote(applicant1);

        // Check vote count
        Applicant memory apl = scholarshipManager.getApplicant(applicant1);
        assertEq(apl.voteCount, 1);

        // Check voter status
        assertTrue(scholarshipManager.getIsAlreadyVote(voter1));
    }

    function testVoteDuplicate() public {
        // Setup voting phase
        scholarshipManager.startApplication(2, 2);

        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        vm.prank(applicant2);
        scholarshipManager.applyApplicant(milestones, "");

        scholarshipManager.openVote();

        // First vote
        vm.prank(voter1);
        scholarshipManager.vote(applicant1);

        // Try to vote again
        vm.prank(voter1);
        vm.expectRevert(ScholarshipApplicantManagement.AlreadyVote.selector);
        scholarshipManager.vote(applicant1);
    }

    function testVoteInvalidApplicant() public {
        scholarshipManager.startApplication(2, 2);

        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        vm.prank(applicant2);
        scholarshipManager.applyApplicant(milestones, "");

        scholarshipManager.openVote();

        // Try to vote for non-applicant
        vm.prank(voter1);
        vm.expectRevert(
            ScholarshipApplicantManagement.OnlyValidApplicant.selector
        );
        scholarshipManager.vote(applicant3);
    }

    // Test milestone withdrawal
    function testMilestoneWithdrawal() public {
        // Setup complete workflow
        scholarshipManager.startApplication(1, 1); // Quorum of 1 for easy testing

        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        scholarshipManager.openVote();

        // Vote to meet quorum
        vm.prank(voter1);
        scholarshipManager.vote(applicant1);

        scholarshipManager.closeBatch();

        // Add funds to contract
        vm.deal(address(scholarshipManager), 1 ether);

        // Withdraw milestone
        uint256 initialBalance = applicant1.balance;

        vm.prank(applicant1);
        vm.expectEmit(true, true, false, true);
        emit MilestoneWithdrawed(1, 1, applicant1);
        scholarshipManager.withrawMilestone(1, 1, "Milestone completed");

        assertEq(applicant1.balance, initialBalance + 0.1 ether);
    }

    function testMilestoneWithdrawalInsufficientQuorum() public {
        scholarshipManager.startApplication(2, 1); // Quorum of 2

        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        scholarshipManager.openVote();

        // Only one vote when quorum is 2
        vm.prank(voter1);
        scholarshipManager.vote(applicant1);

        scholarshipManager.closeBatch();

        vm.deal(address(scholarshipManager), 1 ether);

        vm.prank(applicant1);
        vm.expectRevert(ScholarshipManager.CannotWithdrawNotInQuorum.selector);
        scholarshipManager.withrawMilestone(1, 1, "Milestone completed");
    }

    function testMilestoneWithdrawalOnlyApplicant() public {
        scholarshipManager.startApplication(1, 1);

        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        scholarshipManager.openVote();

        vm.prank(voter1);
        scholarshipManager.vote(applicant1);

        scholarshipManager.closeBatch();

        vm.deal(address(scholarshipManager), 1 ether);

        // Try to withdraw as different user
        vm.prank(applicant2);
        vm.expectRevert(
            ScholarshipMilestoneManagement.OnlyApplicantCanWithdraw.selector
        );
        scholarshipManager.withrawMilestone(1, 1, "Milestone completed");
    }

    function testMilestoneWithdrawalOnlyOnce() public {
        scholarshipManager.startApplication(1, 1);

        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        scholarshipManager.openVote();

        vm.prank(voter1);
        scholarshipManager.vote(applicant1);

        scholarshipManager.closeBatch();

        vm.deal(address(scholarshipManager), 1 ether);

        // First withdrawal
        vm.prank(applicant1);
        scholarshipManager.withrawMilestone(1, 1, "Milestone completed");

        // Try to withdraw again
        vm.prank(applicant1);
        vm.expectRevert(
            ScholarshipMilestoneManagement.WithdrawMilestoneOnlyOnce.selector
        );
        scholarshipManager.withrawMilestone(1, 1, "Milestone completed again");
    }

    // Test batch closure and donation reopening
    function testCloseBatchAndReopenDonation() public {
        scholarshipManager.startApplication(1, 1);

        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        scholarshipManager.openVote();

        vm.expectEmit(false, false, false, true);
        emit VotingCompleted(1);
        scholarshipManager.closeBatch();

        assertEq(
            uint(scholarshipManager.appStatus()),
            uint(ScholarshipStatus.Completed)
        );

        // Reopen for donations
        scholarshipManager.openDonation();
        assertEq(
            uint(scholarshipManager.appStatus()),
            uint(ScholarshipStatus.Pending)
        );
    }

    // Test access control
    function testAccessControlRestrictions() public {
        vm.prank(donor1);
        vm.expectRevert();
        scholarshipManager.startApplication(2, 2);

        vm.prank(donor1);
        vm.expectRevert();
        scholarshipManager.openVote();

        vm.prank(donor1);
        vm.expectRevert();
        scholarshipManager.closeBatch();

        vm.prank(donor1);
        vm.expectRevert();
        scholarshipManager.openDonation();
    }

    // Test full workflow
    function testFullWorkflow() public {
        // 1. Start with donations
        vm.prank(donor1);
        scholarshipManager.donate{value: 0.5 ether}("");

        vm.prank(donor2);
        scholarshipManager.donate{value: 1.0 ether}("");

        assertEq(scholarshipManager.stackedToken(), 1.48 ether); // Total - 2 * fee

        // 2. Start application
        scholarshipManager.startApplication(2, 2);

        // 3. Applications
        uint256[] memory milestones1 = new uint256[](2);
        milestones1[0] = 0.3 ether;
        milestones1[1] = 0.4 ether;

        uint256[] memory milestones2 = new uint256[](1);
        milestones2[0] = 0.5 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones1, "");

        vm.prank(applicant2);
        scholarshipManager.applyApplicant(milestones2, "");

        // 4. Start voting
        scholarshipManager.openVote();

        // 5. Vote
        vm.prank(voter1);
        scholarshipManager.vote(applicant1);

        vm.prank(voter2);
        scholarshipManager.vote(applicant1);

        // 6. Close batch
        scholarshipManager.closeBatch();

        // 7. Fund contract for withdrawals
        vm.deal(address(scholarshipManager), 2 ether);

        // 8. Withdraw milestones
        vm.prank(applicant1);
        scholarshipManager.withrawMilestone(1, 1, "First milestone completed");

        vm.prank(applicant1);
        scholarshipManager.withrawMilestone(1, 2, "Second milestone completed");

        // 9. Reopen for next batch
        scholarshipManager.openDonation();

        // Verify final state
        assertEq(
            uint(scholarshipManager.appStatus()),
            uint(ScholarshipStatus.Pending)
        );
        assertEq(scholarshipManager.appBatch(), 1);
    }

    // Helper function to get milestone data
    function testGetMilestone() public {
        scholarshipManager.startApplication(1, 1);

        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.1 ether;

        vm.prank(applicant1);
        scholarshipManager.applyApplicant(milestones, "");

        ScholarshipMilestoneManagement.Milestone
            memory mile = scholarshipManager.getMilestone(1);

        assertEq(mile.price, 0.1 ether);
        assertEq(mile.metadata, "");
        assertEq(mile.applicant, applicant1);
        assertFalse(mile.isWithdrawed);
    }
}
