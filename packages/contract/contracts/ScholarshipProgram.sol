// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ScholarshipProgramDetails, ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ScholarshipStorageManagement} from "./ScholarshipStorageManagement.sol";
import {ScholarshipManagerAccessControl} from "./ScholarshipManagerAccessControl.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {MilestoneInput, Milestone, MilestoneTemplate} from "./ScholarshipStruct.sol";

contract ScholarshipProgram is
    Initializable,
    ScholarshipStorageManagement,
    ReentrancyGuard,
    ScholarshipManagerAccessControl
{
    string public programMetadataCID;
    address public initiatorAddress;
    uint256 public startDate;
    uint256 public endDate;
    uint256 public targetApplicant;

    address[] public donators;

    event Donated(address indexed donater, uint256 amount);
    event ApplicantApplied(address indexed applicant);
    event Voted(address voter, address applicant);
    event MilestoneWithdrawed(
        uint256 indexed id,
        address user
    );
    event BatchStarted(uint256 applicantTarget);
    event VotingStarted();
    event VotingCompleted();
    event DebugDonateCalled(address caller, uint256 value);

    error CannotWithdrawNotInQuorum();
    error ApplicantNotEnough();
    error NotInMinimalAmount();
    error OnlyDonateOnce();

    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _programMetadataCID,
        address _initiatorAddress,
        uint256 _targetApplicant,
        uint256 _startDate,
        uint256 _endDate
    ) external initializer {
        __ScholarshipManagerAccessControl_init(_initiatorAddress);

        programMetadataCID = _programMetadataCID;
        initiatorAddress = _initiatorAddress;
        startDate = _startDate;
        endDate = _endDate;
        targetApplicant = _targetApplicant;
        applicantTarget = _targetApplicant;
        quorumVote = (_targetApplicant + 1) / 2;
    }

    // factory apply need to update scurity
    function applyProgram(
        address _applicant,
        MilestoneInput[] calldata milestoneIds
    ) external onlyInStatus(ScholarshipStatus.OpenForApplications) {
        _addApplicant(_applicant, milestoneIds);
        // _mintForStudent();
        emit ApplicantApplied(_applicant);
    }

    // apply for this contract
    function applyProgramContract(
        MilestoneInput[] calldata milestoneIds
    ) external onlyInStatus(ScholarshipStatus.OpenForApplications) {
        _addApplicant(msg.sender, milestoneIds);
        // _mintForStudent();
        emit ApplicantApplied(msg.sender);
    }

    // factory vote need update scurity
    function vote(address voter, address applicant) external {
        _voteApplicant(voter, applicant);
        emit Voted(voter, applicant);
    }
    // vote this contract
    function voteContract(address applicant) external {
        _voteApplicant(msg.sender, applicant);
        emit Voted(msg.sender, applicant);
    }

    // factory donate need update scurity
    function donate(
        address donator
    ) external payable onlyInStatus(ScholarshipStatus.OpenForApplications) {
        emit DebugDonateCalled(donator, msg.value);
        if (msg.value < MINIMAL_DONATION) revert NotInMinimalAmount();
        if (alreadyDonate[donator]) revert OnlyDonateOnce();

        stackedToken += msg.value - TRANSACTION_FEE;
        alreadyDonate[donator] = true;
        donators.push(donator);

        emit Donated(donator, msg.value);
    }

    // donate this contract
    function donateContract()
        external
        payable
        onlyInStatus(ScholarshipStatus.OpenForApplications)
    {
        emit DebugDonateCalled(msg.sender, msg.value);
        if (msg.value < MINIMAL_DONATION) revert NotInMinimalAmount();
        if (alreadyDonate[msg.sender]) revert OnlyDonateOnce();

        stackedToken += msg.value - TRANSACTION_FEE;
        alreadyDonate[msg.sender] = true;
        donators.push(msg.sender);

        emit Donated(msg.sender, msg.value);
    }

    function getDonators() external view returns (address[] memory) {
        return donators;
    }

    function getAppStatus() external view returns (ScholarshipStatus) {
        return appStatus;
    }

    function createTemplateMilestone(
        MilestoneInput calldata milestoneInput
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _addMilestoneTemplate(
            milestoneInput.price,
            milestoneInput.metadata
        );
    }

    // exixting fc
    function startApplication(
        uint256 _applicantTarget
    ) external onlyRole(OPEN_ROLE) {
        _openBatch();
        applicantTarget = _applicantTarget;
        targetApplicant = _applicantTarget;
        emit BatchStarted(_applicantTarget);
    }

    function openVote() external onlyRole(OPEN_VOTE_ROLE) {
        if (applicantSize < applicantTarget)
            revert ApplicantNotEnough();
        _openVote();
        emit VotingStarted();
    }

    function closeBatch() external onlyRole(CLOSE_ROLE) {
        _closeBatch();
        emit VotingCompleted();
    }

    function openDonation() external onlyRole(OPEN_DONATION_ROLE) {
        _openDonation();
    }

    function closeDonation() external onlyRole(OPEN_DONATION_ROLE) {
        _closeDonation();
    }

    function withrawMilestone(uint256 id) external nonReentrant {
        Milestone storage _mile = milestones[id];
        if (
            addressToApplicants[_mile.applicant].voteCount <
            quorumVote
        ) revert CannotWithdrawNotInQuorum();
        _withDrawMilestone(id);
        emit MilestoneWithdrawed(id, msg.sender);
    }

    function getApplicants() external view returns (address[] memory) {
        return batchApplicants;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function isCanWithdraw() external view returns (bool) {
        return addressToApplicants[msg.sender].voteCount >= quorumVote;
    }

    receive() external payable {}
}
