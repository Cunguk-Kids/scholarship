// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

enum Rarity {
    Common,
    Rare,
    Epic,
    Legendary
}

contract ScholarshipDonaterNFT is
    ERC721("ScholarshipDonaterNFT", "SDNFT"),
    AccessControl
{
    struct NFTInfo {
        Rarity rarity;
    }

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant SET_BASE_URI_ROLE = keccak256("SET_BASE_URI_ROLE");
    string private __baseURI;

    uint nextToken;

    mapping(uint => NFTInfo) nftInfo;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SET_BASE_URI_ROLE, msg.sender);
    }

    function mint(
        address _reciever,
        Rarity _rarity
    ) external onlyRole(MINTER_ROLE) {
        _mint(_reciever, nextToken);
        nftInfo[nextToken] = NFTInfo({rarity: _rarity});
        nextToken += 1;
    }

    function _baseURI() internal view override returns (string memory) {
        return __baseURI;
    }

    function setBaseURI(
        string calldata ___baseURI
    ) external onlyRole(SET_BASE_URI_ROLE) {
        __baseURI = ___baseURI;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
