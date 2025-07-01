// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ScholarshipApplicantManagement} from "./ScholarshipApplicantManagement.sol";

contract ScholarshipStorageManagement is ScholarshipApplicantManagement {
    uint public constant TRANSACTION_FEE = 0.01 ether;
    uint public constant MINIMAL_DONATION = 0.03 ether;
    uint public stackedToken;
    mapping(uint => uint) applicantTarget;
    mapping(uint => uint) quorumVote;
    mapping(uint => mapping(address => bool)) alreadyDonate;
}
