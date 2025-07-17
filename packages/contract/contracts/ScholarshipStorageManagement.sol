// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ScholarshipApplicantManagement} from "./ScholarshipApplicantManagement.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ScholarshipStorageManagement is ScholarshipApplicantManagement {
    uint public constant TRANSACTION_FEE = 10 * 10**6; // 10 USDC (assuming 6 decimals)
    uint public constant MINIMAL_DONATION = 30 * 10**6; // 30 USDC (assuming 6 decimals)
    uint public stackedToken;
    uint applicantTarget;
    uint quorumVote;
    mapping(address => bool) alreadyDonate;
    
    // ERC20 token configuration
    uint8 public tokenDecimals;
    
    function _initializeToken(address _tokenAddress, uint8 _tokenDecimals) internal {
        donationToken = IERC20(_tokenAddress);
        tokenDecimals = _tokenDecimals;
    }
    
    function getTokenBalance() external view returns (uint256) {
        return donationToken.balanceOf(address(this));
    }
}