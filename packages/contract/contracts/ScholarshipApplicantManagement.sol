// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Applicant} from "./ScholarshipStruct.sol";
import {ScholarshipMilestoneManagement} from "./ScholarshipMilestoneManagment.sol";
import {MilestoneInput} from "./ScholarshipStruct.sol";

contract ScholarshipApplicantManagement is ScholarshipMilestoneManagement {
    mapping(address => Applicant) addressToApplicants;
    address[] internal batchApplicants;
    mapping(address => bool) isAlreadyVote;
    uint public applicantSize;

    error AlreadyApply();
    error OnlyValidApplicant();
    error AlreadyVote();

    function getIsAlreadyVote(address voter_) public view returns (bool) {
        return isAlreadyVote[voter_];
    }

    function getApplicantSize() public view returns (uint) {
        return applicantSize;
    }

    function _addApplicant(
        address _applicantAddress,
        MilestoneInput[] calldata milestones_
    ) internal {
        if (getApplicant(_applicantAddress).applicantAddress != address(0x0))
            revert AlreadyApply();
        addressToApplicants[_applicantAddress] = Applicant({
            applicantAddress: _applicantAddress,
            voteCount: 0
        });

        batchApplicants.push(_applicantAddress);
        applicantSize++;
        _addMilestones(_applicantAddress, milestones_);
    }

    function _voteApplicant(
        address _voter,
        address _applicant
    ) internal onlyValidApplicant(_applicant) {
        if (getIsAlreadyVote(_voter)) revert AlreadyVote();
        addressToApplicants[_applicant].voteCount++;
        isAlreadyVote[_voter] = true;
    }

    function getApplicant(
        address _applicantAddress
    ) public view returns (Applicant memory) {
        return addressToApplicants[_applicantAddress];
    }

    function _onlyValidApplicant(address _applicantAddress) internal view {
        if (getApplicant(_applicantAddress).applicantAddress == address(0x0))
            revert OnlyValidApplicant();
    }

    modifier onlyValidApplicant(address _applicantAddress) {
        _onlyValidApplicant(_applicantAddress);
        _;
    }

    function _getAllApplicantsWithVotes()
        external
        view
        returns (address[] memory, uint[] memory)
    {
        uint size = batchApplicants.length;
        address[] memory addresses = new address[](size);
        uint[] memory votes = new uint[](size);

        for (uint i = 0; i < size; i++) {
            address applicant = batchApplicants[i];
            addresses[i] = applicant;
            votes[i] = addressToApplicants[applicant].voteCount;
        }

        return (addresses, votes);
    }
}
