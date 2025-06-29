// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ScholarshipStorageManagement} from "./ScholarshipStorageManagement.sol";
import {ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ScholarshipNFTMintingManager} from "./ScholarshipNFTMintingManager.sol";

contract ScholarshipManager is
    ScholarshipStorageManagement,
    ScholarshipNFTMintingManager,
    Ownable(msg.sender)
{
    constructor(
        address _donaterNFTAddress
    ) ScholarshipNFTMintingManager(_donaterNFTAddress) {}

    event ApplicantApplied(address indexed applicantAddress);
    event Voted(address voter, address applicant);

    error NotInMinimalAmount();
    error CannotWithdrawNotInQuorum();

    function startApplication(
        uint256 _quorum
    ) external onlyOwner {
        _openBatch();
        quorumVote[appBatch] = _quorum;
    }

    function applyApplicant(
        uint256[] calldata milestones_
    ) external onlyInStatus(ScholarshipStatus.OpenForApplications) {
        _addApplicant(msg.sender, milestones_);
        emit ApplicantApplied(msg.sender);
    }

    function donate() external payable {
        if (msg.value < MINIMAL_DONATION) revert NotInMinimalAmount();
        stackedToken += msg.value - TRANSACTION_FEE;
        _mintForDonater(msg.value);
    }

    function vote(address _applicantAddress) external {
        _voteApplicant(msg.sender, _applicantAddress);
        emit Voted(msg.sender, _applicantAddress);
    }

    function withrawMilestone(
        uint256 batch,
        uint256 id,
        string calldata metadata
    ) external {
        Milestone storage _mile = milestones[batch][id];
        if (
            addressToApplicants[batch][_mile.applicant].voteCount <
            quorumVote[batch]
        ) revert CannotWithdrawNotInQuorum();
        _withDrawMilestone(batch, id, metadata);
    }
}
