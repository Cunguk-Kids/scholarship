// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ScholarshipBatchManagement} from "./ScholarshipBatchManagement.sol";
import {Milestone, MilestoneTemplate, MilestoneType, MilestoneInput} from "./ScholarshipStruct.sol";
contract ScholarshipMilestoneManagement is ScholarshipBatchManagement {
    mapping(uint => Milestone) milestones;
    uint nextMilestone;
    uint nextMilestoneTemplate;
    mapping(uint templateId => MilestoneTemplate) public milestoneTemplates;

    event AddMilestone(uint indexed id, uint price, address applicant);
    event MilestoneTemplateAdded(
        uint indexed templateId,
        uint price,
        string metadata
    );

    error OnlyValidMilestone();
    error OnlyApplicantCanWithdraw();
    error DonationIsNotEnough();
    error ArrayCannotEmpty();
    error WithdrawMilestoneOnlyOnce();

    function getNextMilestone() public view returns (uint) {
        return nextMilestone;
    }

    function _addNextMilestone() private {
        nextMilestone++;
    }

    function _onlyValidMilestone(uint id) internal view {
        uint _nextMilestone = getNextMilestone();
        if (_nextMilestone == 0 || id > _nextMilestone)
            revert OnlyValidMilestone();
    }

    function getAllMilestoneTemplates()
        public
        view
        returns (MilestoneTemplate[] memory)
    {
        uint count = nextMilestoneTemplate;
        MilestoneTemplate[] memory templates = new MilestoneTemplate[](count);

        for (uint i = 0; i < count; ) {
            // nextMilestoneTemplate - i
            templates[i] = milestoneTemplates[i];
            unchecked {
                ++i;
            }
        }

        return templates;
    }

    modifier onlyValidMilestone(uint id) {
        _onlyValidMilestone(id);
        _;
    }

    function _addMilestoneTemplate(
        uint price,
        string calldata metadataCID
    ) internal {
        uint currentId = nextMilestoneTemplate;
        milestoneTemplates[currentId] = MilestoneTemplate({
            price: price,
            metadata: metadataCID
        });

        nextMilestoneTemplate++;

        emit MilestoneTemplateAdded(currentId, price, metadataCID);
    }

    function _addMilestones(
        address applicant_,
        MilestoneInput[] calldata _milestones
    ) internal {
        if (_milestones.length < 1) revert ArrayCannotEmpty();
        for (uint i = 0; i < _milestones.length; i += 1) {
            MilestoneInput memory inputData = _milestones[i];
            uint price;
            string memory metadata;

            if (inputData.mType == MilestoneType.TEMPLATE) {
                MilestoneTemplate memory tmpl = milestoneTemplates[
                    inputData.templateId
                ];
                price = tmpl.price;
                metadata = tmpl.metadata;
            } else {
                price = inputData.price;
                metadata = inputData.metadata;
            }
            _addNextMilestone();
            uint currentMilestoneId = getNextMilestone();
            milestones[currentMilestoneId] = Milestone({
                price: price,
                metadata: metadata,
                applicant: applicant_,
                isWithdrawed: false,
                mType: MilestoneType.CUSTOM
            });
            emit AddMilestone(currentMilestoneId, price, applicant_);
        }
    }

    function _withDrawMilestone(uint _id) internal {
        if (nextMilestone == 0 || _id > nextMilestone)
            revert OnlyValidMilestone();
        Milestone memory milestone = milestones[_id];
        if (milestone.applicant != msg.sender)
            revert OnlyApplicantCanWithdraw();
        if (milestone.isWithdrawed) revert WithdrawMilestoneOnlyOnce();
        milestones[_id].isWithdrawed = true;
        (bool isSuccess, ) = milestone.applicant.call{value: milestone.price}(
            ""
        );
        if (!isSuccess) revert DonationIsNotEnough();
    }

    function getMilestone(
        uint id
    ) public view returns (Milestone memory) {
        return milestones[id];
    }
}
