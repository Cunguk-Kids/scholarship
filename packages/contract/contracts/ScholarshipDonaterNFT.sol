// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

enum Rarity {
    Common,
    Rare,
    Epic,
    Legendary
}

contract ScholarshipDonaterNFT is
    ERC721("ScholarshipDonaterNFT", "SDNFT"),
    Ownable(msg.sender)
{
    struct NFTInfo {
        Rarity rarity;
    }

    uint nextToken;

    mapping(uint => NFTInfo) nftInfo;

    function mint(address _reciever, Rarity _rarity) external onlyOwner {
        _mint(_reciever, nextToken);
        nftInfo[nextToken] = NFTInfo({rarity: _rarity});
        nextToken += 1;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }
}
