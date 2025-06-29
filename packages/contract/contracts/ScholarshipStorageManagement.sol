// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ScholarshipApplicantManagement} from "./ScholarshipApplicantManagement.sol";

contract ScholarshipStorageManagement is
    ScholarshipApplicantManagement
{
    uint public scholarshipTargetAmount;
    uint public stackedToken;
    uint public quorumVote;
}
