// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ScholarshipProgramDetails, ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ScholarshipStorageManagement} from "./ScholarshipStorageManagement.sol";
import {ScholarshipManagerAccessControl} from "./ScholarshipManagerAccessControl.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ScholarshipProgram is
    Initializable,
    ScholarshipStorageManagement,
    ReentrancyGuard,
    OwnableUpgradeable,
    ScholarshipManagerAccessControl
{
    string public programMetadataCID;
    address public initiatorAddress;
    uint256 public startDate;
    uint256 public endDate;
    uint256 public targetApplicant;

    address[] public donators;

    event Donated(address indexed donater, uint256 batchId, uint256 amount);
    event ApplicantApplied(address indexed applicant, uint256 batchId);
    event Voted(address voter, address applicant, uint256 batchId);
    event MilestoneWithdrawed(
        uint256 indexed id,
        uint256 indexed batch,
        address user
    );
    event BatchStarted(uint256 batchId, uint256 applicantTarget);
    event VotingStarted(uint256 batchId);
    event VotingCompleted(uint256 batchId);

    error CannotWithdrawNotInQuorum();
    error ApplicantNotEnough();
    error NotInMinimalAmount();
    error OnlyDonateOnce();

    function initialize(
        string memory _programMetadataCID,
        address _initiatorAddress,
        uint256 _targetApplicant,
        uint256 _startDate,
        uint256 _endDate
    ) external initializer {
        __Ownable_init(_initiatorAddress);
        __ScholarshipManagerAccessControl_init();
        programMetadataCID = _programMetadataCID;
        initiatorAddress = _initiatorAddress;
        startDate = _startDate;
        endDate = _endDate;
        targetApplicant = _targetApplicant;
        appBatch = 0;

        applicantTarget[appBatch] = _targetApplicant;
        quorumVote[appBatch] = (_targetApplicant + 1) / 2;
    }

    function applyProgram(
        uint[] calldata milestoneIds
    ) external onlyInStatus(ScholarshipStatus.OpenForApplications) {
        _addApplicant(msg.sender, milestoneIds);
        // _mintForStudent();
        emit ApplicantApplied(msg.sender, appBatch);
    }

    function vote(address applicant) external {
        _voteApplicant(msg.sender, applicant);
        emit Voted(msg.sender, applicant, appBatch);
    }

    function donate()
        external
        payable
        onlyInStatus(ScholarshipStatus.VotingOpen)
    {
        if (msg.value < MINIMAL_DONATION) revert NotInMinimalAmount();
        if (alreadyDonate[appBatch][msg.sender]) revert OnlyDonateOnce();

        stackedToken += msg.value - TRANSACTION_FEE;
        // _mintForDonater(uri);
        alreadyDonate[appBatch][msg.sender] = true;
        donators.push(msg.sender);

        emit Donated(msg.sender, appBatch, msg.value);
    }

    function getDonators() external view returns (address[] memory) {
        return donators;
    }

    function getAppStatus() external view returns (ScholarshipStatus) {
        return appStatus;
    }

    // exixting fc
    function startApplication(
        uint256 _applicantTarget
    ) external onlyRole(OPEN_ROLE) {
        _openBatch();
        applicantTarget[appBatch] = _applicantTarget;
        emit BatchStarted(appBatch, _applicantTarget);
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

    function getApplicants() external view returns (address[] memory) {
        return batchApplicants[appBatch];
    }
}
