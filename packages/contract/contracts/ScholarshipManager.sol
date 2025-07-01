// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ScholarshipStorageManagement} from "./ScholarshipStorageManagement.sol";
import {ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ScholarshipNFTMintingManager} from "./ScholarshipNFTMintingManager.sol";
import {ScholarshipManagerAccessControl} from "./ScholarshipManagerAccessControl.sol";

contract ScholarshipManager is
    ScholarshipStorageManagement,
    ScholarshipNFTMintingManager,
    ReentrancyGuard,
    ScholarshipManagerAccessControl,
    Ownable(msg.sender)
{
    constructor(
        address _donaterNFTAddress,
        address _studentNFTAddress
    ) ScholarshipNFTMintingManager(_donaterNFTAddress, _studentNFTAddress) {}

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

    error NotInMinimalAmount();
    error CannotWithdrawNotInQuorum();
    error ApplicantNotEnough();
    error OnlyDonateOnce();

    function startApplication(
        uint256 _quorum,
        uint256 _applicantTarget
    ) external onlyRole(OPEN_ROLE) {
        _openBatch();
        quorumVote[appBatch] = _quorum;
        applicantTarget[appBatch] = _applicantTarget;
        emit BatchStarted(appBatch, _quorum, _applicantTarget);
    }

    function openVote() external onlyRole(OPEN_VOTE_ROLE) {
        if (applicantTarget[appBatch] != applicantSize[appBatch])
            revert ApplicantNotEnough();
        _openVote();
        emit VotingStarted(appBatch);
    }

    function closeBatch() external onlyRole(CLOSE_ROLE) {
        _closeBatch();
        emit VotingCompleted(appBatch);
    }

    function openDonation() external onlyRole(OPEN_DONATION_ROLE) {
        _openForDonation();
    }

    function applyApplicant(
        uint256[] calldata milestones_
    ) external onlyInStatus(ScholarshipStatus.OpenForApplications) {
        _addApplicant(msg.sender, milestones_);
        _mintForStudent();
        emit ApplicantApplied(msg.sender, appBatch);
    }

    function donate() external payable onlyInStatus(ScholarshipStatus.Pending) {
        if (msg.value < MINIMAL_DONATION) revert NotInMinimalAmount();
        if (alreadyDonate[appBatch][msg.sender]) revert OnlyDonateOnce();
        stackedToken += msg.value - TRANSACTION_FEE;
        _mintForDonater(msg.value);
        alreadyDonate[appBatch][msg.sender] = true;
        emit Donated(msg.sender, appBatch, msg.value);
    }

    function vote(address _applicantAddress) external {
        _voteApplicant(msg.sender, _applicantAddress);
        emit Voted(msg.sender, _applicantAddress, appBatch);
    }

    function withrawMilestone(
        uint256 batch,
        uint256 id,
        string calldata metadata
    ) external nonReentrant {
        Milestone storage _mile = milestones[batch][id];
        if (
            addressToApplicants[batch][_mile.applicant].voteCount <
            quorumVote[batch]
        ) revert CannotWithdrawNotInQuorum();
        _withDrawMilestone(batch, id, metadata);
        emit MilestoneWithdrawed(id, batch, msg.sender);
    }
}
