// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ScholarshipStatus} from "./ScholarshipStruct.sol";

contract ScholarshipBatchManagement {
    ScholarshipStatus public appStatus;
    uint public appBatch;

    error OnlyInStatus(ScholarshipStatus status);

    function _openBatch() internal onlyInStatus(ScholarshipStatus.Pending) {
        appBatch += 1;
        _changeStatus(ScholarshipStatus.OpenForApplications);
    }

    function _openVote()
        internal
        onlyInStatus(ScholarshipStatus.OpenForApplications)
    {
        _changeStatus(ScholarshipStatus.VotingOpen);
    }

    function _closeBatch() internal onlyInStatus(ScholarshipStatus.VotingOpen) {
        _changeStatus(ScholarshipStatus.Completed);
    }

    function _openForDonation()
        internal
        onlyInStatus(ScholarshipStatus.Completed)
    {
        _changeStatus(ScholarshipStatus.Pending);
    }

    function _changeStatus(ScholarshipStatus status) private {
        appStatus = status;
    }

    function _onlyInStatus(ScholarshipStatus status) internal view {
        if (appStatus != status) revert OnlyInStatus(status);
    }

    modifier onlyInStatus(ScholarshipStatus status) {
        _onlyInStatus(status);
        _;
    }
}
