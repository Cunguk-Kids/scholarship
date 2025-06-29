// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ScholarshipBatchManagement} from "./ScholarshipBatchManagement.sol";

contract ScholarshipMilestoneManagement is ScholarshipBatchManagement {
    struct Milestone {
        uint price;
        string metadata;
        address applicant;
        bool isWithdrawed;
    }

    mapping(uint => mapping(uint => Milestone)) milestones;
    mapping(uint => uint) nextMilestone;

    event AddMilestone(uint indexed id, uint price, address applicant);

    error OnlyValidMilestone();
    error OnlyApplicantCanWithdraw();
    error DonationIsNotEnough();

    function getNextMilestone() public view returns (uint) {
        return nextMilestone[appBatch];
    }

    function _addNextMilestone() private {
        nextMilestone[appBatch] += 1;
    }

    function _onlyValidMilestone(uint id) public view {
        uint _nextMilestone = getNextMilestone();
        if (_nextMilestone == 0 || id > _nextMilestone)
            revert OnlyValidMilestone();
    }

    modifier onlyValidMilestone(uint id) {
        _onlyValidMilestone(id);
        _;
    }

    function _addMilestones(
        address applicant_,
        uint[] calldata _milestones
    ) internal {
        for (uint i = 0; i < _milestones.length; i += 1) {
            uint price = _milestones[i];
            _addNextMilestone();
            uint currentMilestoneId = getNextMilestone();
            milestones[appBatch][currentMilestoneId] = Milestone({
                price: price,
                metadata: "",
                applicant: applicant_,
                isWithdrawed: false
            });
            emit AddMilestone(currentMilestoneId, price, applicant_);
        }
    }

    function _withDrawMilestone(
        uint batch,
        uint id,
        string calldata metadata
    ) internal {
        Milestone memory milestone = milestones[batch][id];
        if (milestone.applicant != msg.sender)
            revert OnlyApplicantCanWithdraw();
        milestones[batch][id].metadata = metadata;
        milestones[batch][id].isWithdrawed = true;
        (bool isSuccess, ) = milestone.applicant.call{value: milestone.price}(
            ""
        );
        if (isSuccess) revert DonationIsNotEnough();
    }

    function getMilestone(
        uint id
    ) public view onlyValidMilestone(id) returns (Milestone memory) {
        return milestones[appBatch][id];
    }
}
