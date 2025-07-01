// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ScholarshipDonaterNFT} from "./ScholarshipDonaterNFT.sol";
import {ScholarshipStudentNFT} from "./ScholarshipStudentNFT.sol";

contract ScholarshipNFTMintingManager {
    ScholarshipDonaterNFT donaterNFTAddress;
    ScholarshipStudentNFT studentNFTAddress;

    constructor(address _donaterNFTAddress, address _studentNFTAddress) {
        donaterNFTAddress = ScholarshipDonaterNFT(_donaterNFTAddress);
        studentNFTAddress = ScholarshipStudentNFT(_studentNFTAddress);
    }

    function _mintForDonater(string calldata uri) internal {
        donaterNFTAddress.mint(msg.sender, uri);
    }

    function _mintForStudent(string calldata uri) internal {
        studentNFTAddress.mint(msg.sender, uri);
    }
}
