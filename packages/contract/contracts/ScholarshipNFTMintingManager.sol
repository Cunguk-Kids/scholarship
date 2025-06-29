// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ScholarshipDonaterNFT, Rarity} from "./ScholarshipDonaterNFT.sol";

contract ScholarshipNFTMintingManager {
    ScholarshipDonaterNFT donaterNFTAddress;

    constructor(address _donaterNFTAddress) {
        donaterNFTAddress = ScholarshipDonaterNFT(_donaterNFTAddress);
    }

    function _mintForDonater(uint amount) internal {
        donaterNFTAddress.mint(msg.sender, _mapRarity(amount));
    }

    function _mapRarity(uint amount) internal pure returns (Rarity rarity_) {
        if (amount <= 0.1 ether) return Rarity.Common;
        if (amount <= 0.5 ether) return Rarity.Rare;
        if (amount <= 1 ether) return Rarity.Epic;
        return Rarity.Legendary;
    }
}
