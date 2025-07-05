// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ScholarshipBatchManagement} from "./ScholarshipBatchManagement.sol";
import {Milestone, MilestoneTemplate, MilestoneType, MilestoneInput} from "./ScholarshipStruct.sol";
contract ScholarshipMilestoneManagement is ScholarshipBatchManagement {
    mapping(uint => mapping(uint => Milestone)) milestones;
    mapping(uint => uint) nextMilestone;
    mapping(uint batchId => uint) nextMilestoneTemplate;
    mapping(uint batchId => mapping(uint templateId => MilestoneTemplate))
        public milestoneTemplates;

    event AddMilestone(uint indexed id, uint price, address applicant);
    event MilestoneTemplateAdded(
        uint indexed batchId,
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
        return nextMilestone[appBatch];
    }

    function _addNextMilestone() private {
        nextMilestone[appBatch]++;
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
        uint count = nextMilestoneTemplate[appBatch];
        MilestoneTemplate[] memory templates = new MilestoneTemplate[](count);

        for (uint i = 0; i < count; ) {
            // nextMilestoneTemplate - i
            templates[i] = milestoneTemplates[appBatch][i];
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
        uint batchId,
        uint price,
        string calldata metadataCID
    ) internal {
        uint currentId = nextMilestoneTemplate[batchId];
        milestoneTemplates[batchId][currentId] = MilestoneTemplate({
            price: price,
            metadata: metadataCID
        });

        nextMilestoneTemplate[batchId]++;

        emit MilestoneTemplateAdded(batchId, currentId, price, metadataCID);
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
                MilestoneTemplate memory tmpl = milestoneTemplates[appBatch][
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
            milestones[appBatch][currentMilestoneId] = Milestone({
                price: price,
                metadata: metadata,
                applicant: applicant_,
                isWithdrawed: false,
                mType: MilestoneType.CUSTOM
            });
            emit AddMilestone(currentMilestoneId, price, applicant_);
        }
    }

    function _withDrawMilestone(uint batch, uint _id) internal {
        if (batch == 0 || batch > appBatch) revert OnlyValidMilestone();
        if (nextMilestone[batch] == 0 || _id > nextMilestone[batch])
            revert OnlyValidMilestone();
        Milestone memory milestone = milestones[batch][_id];
        if (milestone.applicant != msg.sender)
            revert OnlyApplicantCanWithdraw();
        if (milestone.isWithdrawed) revert WithdrawMilestoneOnlyOnce();
        milestones[batch][_id].isWithdrawed = true;
        (bool isSuccess, ) = milestone.applicant.call{value: milestone.price}(
            ""
        );
        if (!isSuccess) revert DonationIsNotEnough();
    }

    function getMilestone(
        uint batch,
        uint id
    ) public view returns (Milestone memory) {
        return milestones[batch][id];
    }

    function _onlyValidMilestone(uint batch, uint id) internal view {
        if (batch == 0 || batch > appBatch) revert OnlyValidMilestone();
        if (nextMilestone[batch] == 0 || id >= nextMilestone[batch])
            revert OnlyValidMilestone();
    }
}
