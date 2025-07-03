// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Applicant} from "./ScholarshipStruct.sol";
import {ScholarshipMilestoneManagement} from "./ScholarshipMilestoneManagment.sol";

contract ScholarshipApplicantManagement is ScholarshipMilestoneManagement {
    mapping(uint => mapping(address => Applicant)) addressToApplicants;
    mapping(uint => address[]) internal batchApplicants;
    mapping(uint => mapping(address => bool)) isAlreadyVote;
    mapping(uint => uint) public applicantSize;

    error AlreadyApply();
    error OnlyValidApplicant();
    error AlreadyVote();

    function getIsAlreadyVote(address voter_) public view returns (bool) {
        return isAlreadyVote[appBatch][voter_];
    }

    function getApplicantSize() public view returns (uint) {
        return applicantSize[appBatch];
    }

    function _addApplicant(
        address _applicantAddress,
        uint[] calldata milestones_
    ) internal {
        if (getApplicant(_applicantAddress).applicantAddress != address(0x0))
            revert AlreadyApply();
        addressToApplicants[appBatch][_applicantAddress] = Applicant({
            applicantAddress: _applicantAddress,
            voteCount: 0
        });

        batchApplicants[appBatch].push(_applicantAddress);
        applicantSize[appBatch] += 1;
        _addMilestones(_applicantAddress, milestones_);
    }

    function _voteApplicant(
        address _voter,
        address _applicant
    ) internal onlyValidApplicant(_applicant) {
        if (getIsAlreadyVote(_voter)) revert AlreadyVote();
        addressToApplicants[appBatch][_applicant].voteCount += 1;
        isAlreadyVote[appBatch][_voter] = true;
    }

    function getApplicant(
        address _applicantAddress
    ) public view returns (Applicant memory) {
        return addressToApplicants[appBatch][_applicantAddress];
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
        uint size = batchApplicants[appBatch].length;
        address[] memory addresses = new address[](size);
        uint[] memory votes = new uint[](size);

        for (uint i = 0; i < size; i++) {
            address applicant = batchApplicants[appBatch][i];
            addresses[i] = applicant;
            votes[i] = addressToApplicants[appBatch][applicant].voteCount;
        }

        return (addresses, votes);
    }
}
