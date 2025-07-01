// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ScholarshipDonaterNFT, Rarity} from "./ScholarshipDonaterNFT.sol";
import {ScholarshipStudentNFT} from "./ScholarshipStudentNFT.sol";

contract ScholarshipNFTMintingManager {
    ScholarshipDonaterNFT donaterNFTAddress;
    ScholarshipStudentNFT studentNFTAddress;

    constructor(address _donaterNFTAddress, address _studentNFTAddress) {
        donaterNFTAddress = ScholarshipDonaterNFT(_donaterNFTAddress);
        studentNFTAddress = ScholarshipStudentNFT(_studentNFTAddress);
    }

    function _mintForDonater(uint amount) internal {
        donaterNFTAddress.mint(msg.sender, _mapRarity(amount));
    }

    function _mintForStudent() internal {
        studentNFTAddress.mint(msg.sender);
    }

    function _mapRarity(uint amount) internal pure returns (Rarity rarity_) {
        if (amount <= 0.1 ether) return Rarity.Common;
        if (amount <= 0.5 ether) return Rarity.Rare;
        if (amount <= 1 ether) return Rarity.Epic;
        return Rarity.Legendary;
    }
}
