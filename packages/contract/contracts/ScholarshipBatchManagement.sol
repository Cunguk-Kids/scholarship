// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ScholarshipStatus} from "./ScholarshipStruct.sol";

contract ScholarshipBatchManagement {
    ScholarshipStatus public appStatus;
    uint public appBatch;

    error OnlyInStatus(ScholarshipStatus status);

    function _openBatch() internal {
        appBatch += 1;
        appStatus = ScholarshipStatus.OpenForApplications;
    }

    function _changeStatus(ScholarshipStatus status) internal {
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
