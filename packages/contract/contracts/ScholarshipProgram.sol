// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ScholarshipProgramDetails, ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ScholarshipStorageManagement} from "./ScholarshipStorageManagement.sol";
import {ScholarshipManagerAccessControl} from "./ScholarshipManagerAccessControl.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {MilestoneInput, Milestone, MilestoneTemplate} from "./ScholarshipStruct.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    error InsufficientAllowance();
    error InsufficientTokenBalance();

    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _programMetadataCID,
        address _initiatorAddress,
        uint256 _targetApplicant,
        uint256 _startDate,
        uint256 _endDate,
        address _tokenAddress,
        uint8 _tokenDecimals
    ) external initializer {
        __ScholarshipManagerAccessControl_init(_initiatorAddress);

        programMetadataCID = _programMetadataCID;
        initiatorAddress = _initiatorAddress;
        startDate = _startDate;
        endDate = _endDate;
        targetApplicant = _targetApplicant;
        applicantTarget = _targetApplicant;
        quorumVote = (_targetApplicant + 1) / 2;
        
        // Initialize ERC20 token
        _initializeToken(_tokenAddress, _tokenDecimals);
    }

    // factory apply need to update security
    function applyProgram(
        address _applicant,
        MilestoneInput[] calldata milestoneIds
    ) external onlyInStatus(ScholarshipStatus.OpenForApplications) {
        _addApplicant(_applicant, milestoneIds);
        emit ApplicantApplied(_applicant);
    }

    // apply for this contract
    function applyProgramContract(
        MilestoneInput[] calldata milestoneIds
    ) external onlyInStatus(ScholarshipStatus.OpenForApplications) {
        _addApplicant(msg.sender, milestoneIds);
        emit ApplicantApplied(msg.sender);
    }

    // factory vote need update security
    function vote(address voter, address applicant) external {
        _voteApplicant(voter, applicant);
        emit Voted(voter, applicant);
    }
    
    // vote this contract
    function voteContract(address applicant) external {
        _voteApplicant(msg.sender, applicant);
        emit Voted(msg.sender, applicant);
    }

    // factory donate need update security
    function donate(
        address donator,
        uint256 amount
    ) external onlyInStatus(ScholarshipStatus.OpenForApplications) {
        emit DebugDonateCalled(donator, amount);
        
        if (amount < MINIMAL_DONATION) revert NotInMinimalAmount();
        if (alreadyDonate[donator]) revert OnlyDonateOnce();
        
        // Check if donator has enough tokens
        if (donationToken.balanceOf(donator) < amount) {
            revert InsufficientTokenBalance();
        }
        
        // Check if contract has enough allowance
        if (donationToken.allowance(donator, address(this)) < amount) {
            revert InsufficientAllowance();
        }
        
        // Transfer tokens from donator to this contract
        bool success = donationToken.transferFrom(donator, address(this), amount);
        if (!success) {
            revert TokenTransferFailed();
        }

        stackedToken += amount - TRANSACTION_FEE;
        alreadyDonate[donator] = true;
        donators.push(donator);

        emit Donated(donator, amount);
    }

    // donate this contract
    function donateContract(
        uint256 amount
    ) external onlyInStatus(ScholarshipStatus.OpenForApplications) {
        emit DebugDonateCalled(msg.sender, amount);
        
        if (amount < MINIMAL_DONATION) revert NotInMinimalAmount();
        if (alreadyDonate[msg.sender]) revert OnlyDonateOnce();
        
        // Check if sender has enough tokens
        if (donationToken.balanceOf(msg.sender) < amount) {
            revert InsufficientTokenBalance();
        }
        
        // Check if contract has enough allowance
        if (donationToken.allowance(msg.sender, address(this)) < amount) {
            revert InsufficientAllowance();
        }
        
        // Transfer tokens from sender to this contract
        bool success = donationToken.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert TokenTransferFailed();
        }

        stackedToken += amount - TRANSACTION_FEE;
        alreadyDonate[msg.sender] = true;
        donators.push(msg.sender);

        emit Donated(msg.sender, amount);
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

    // existing functions
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
        return donationToken.balanceOf(address(this));
    }

    function isCanWithdraw() external view returns (bool) {
        return addressToApplicants[msg.sender].voteCount >= quorumVote;
    }
}