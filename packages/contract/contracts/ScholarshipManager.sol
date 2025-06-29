// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ScholarshipStorageManagement} from "./ScholarshipStorageManagement.sol";
import {ScholarshipStatus} from "./ScholarshipStruct.sol";

/**
 * @title IScholarshipManagement
 * @dev This interface defines the core functionalities for a decentralized scholarship management system.
 * It covers applicant management, donor contributions, voting, and scholarship disbursement.
 */
contract ScholarshipManager is
    ScholarshipStorageManagement,
    Ownable(msg.sender)
{
    event ScholarshipTargetSet(uint256 targetAmount);

    /**
     * @dev Emitted when funds are received from a donor.
     * @param donor The address of the donor.
     * @param amount The amount of funds contributed.
     */
    event FundsReceived(address indexed donor, uint256 amount);

    /**
     * @dev Emitted when the application period for the scholarship officially begins.
     */
    event ApplicationsStarted();

    /**
     * @dev Emitted when a new applicant successfully applies for the scholarship.
     * @param applicantAddress The address of the applicant.
     */
    event ApplicantApplied(address indexed applicantAddress);

    /**
     * @dev Emitted when an applicant's interview status is updated by the admin.
     * @param applicantAddress The address of the applicant.
     */
    event ApplicantInterviewed(address indexed applicantAddress);

    /**
     * @dev Emitted when an applicant is approved and added to the voting pool.
     * @param applicantAddress The address of the applicant.
     */
    event ApplicantApprovedForVoting(address indexed applicantAddress);

    /**
     * @dev Emitted when an applicant reaches the required voting quorum.
     * @param applicantAddress The address of the applicant who reached quorum.
     */
    event QuorumReached(address indexed applicantAddress);

    /**
     * @dev Emitted when the scholarship winner is officially announced.
     * @param winnerAddress The address of the scholarship recipient.
     */
    event ScholarshipWinnerAnnounced(address indexed winnerAddress);

    /**
     * @dev Emitted when a scholarship recipient successfully withdraws their monthly allowance.
     * @param recipient The address of the scholarship recipient.
     * @param amount The amount of USDC withdrawn.
     */
    event AllowanceWithdrawn(address indexed recipient, uint256 amount);

    /**
     * @dev Emitted when a donor successfully claims their reward NFT.
     * @param donor The address of the donor who claimed the NFT.
     */
    event DonorRewardClaimed(address indexed donor);

    /**
     * @dev Emitted when a scholarship recipient's NFT expires.
     * @param recipient The address of the scholarship recipient.
     */
    event RecipientNFTExpired(address indexed recipient);

    event Voted(address voter, address applicant);

    error NotInMinimalAmount();

    // --- Admin Functions ---

    /**
     * @dev Sets the target amount of funds required for the scholarship to proceed.
     * Only callable by an authorized admin.
     * @param _targetAmount The desired target amount in USDC (or equivalent token units).
     */
    function setScholarshipTarget(uint256 _targetAmount) external onlyOwner {
        scholarshipTargetAmount = _targetAmount;
    }

    /**
     * @dev Starts the application period for the scholarship.
     * Only callable by an authorized admin after the target funds are met.
     */
    function startApplication(uint _quorum) external onlyOwner {
        quorumVote = _quorum;
        _openBatch();
    }

    /**
     * @dev Marks an applicant as having completed their interview.
     * Only callable by an authorized admin.
     * @param _applicantAddress The address of the applicant to mark as interviewed.
     */
    function applyApplicant(
        address _applicantAddress
    ) external onlyInStatus(ScholarshipStatus.OpenForApplications) {
        _addApplicant(_applicantAddress);
        emit ApplicantApplied(_applicantAddress);
    }

    // // --- Donor Functions ---

    /**
     * @dev Allows a donor to contribute funds to the scholarship.
     * Funds are staked in the contract until the target is reached.
     */
    function donate() external payable {
        if (msg.value < 0.001 ether) revert NotInMinimalAmount();
        stackedToken += msg.value;
    }

    /**
     * @dev Allows a donor to cast a vote for a scholarship applicant.
     * Donors must have voting power and can only vote once per applicant.
     * @param _applicantAddress The address of the applicant to vote for.
     */
    function vote(address _applicantAddress) external {
        _voteApplicant(msg.sender, _applicantAddress);
        emit Voted(msg.sender, _applicantAddress);
    }

    function withrawMilestone(
        uint batch,
        uint id,
        string calldata metadata
    ) external {
        _withDrawMilestone(batch, id, metadata);
    }
}
