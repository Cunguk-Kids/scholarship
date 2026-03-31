// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BaseCredentialNFT
 * @dev Shared base for Donor and Student NFTs.
 *      These are non-transferable credentials (Soulbound ERC-721).
 *      They serve as permanent on-chain proof of participation.
 */
abstract contract BaseCredentialNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _nextTokenId;

    error SoulboundCannotTransfer();
    error AlreadyMinted(address wallet);

    // Track one NFT per wallet per program
    mapping(address => mapping(uint256 => bool)) public hasMinted;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Soulbound: block all transfers except mint and burn.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert SoulboundCannotTransfer();
        }
        return super._update(to, tokenId, auth);
    }

    function mint(
        address recipient,
        uint256 programId,
        string calldata metadataURI
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        if (hasMinted[recipient][programId]) revert AlreadyMinted(recipient);

        tokenId = _nextTokenId++;
        hasMinted[recipient][programId] = true;
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);
    }

    function supportsInterface(bytes4 interfaceId)
        public view virtual override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

// ════════════════════════════════════════════════════════════════════════

/**
 * @title DonorNFT
 * @dev Minted to donors after donating to a program.
 *      Permanent proof of philanthropic contribution.
 *      Metadata includes: program info, donation amount, programs backed.
 */
contract DonorNFT is BaseCredentialNFT("ScholarshipDonor", "SDNFT") {}

// ════════════════════════════════════════════════════════════════════════

/**
 * @title StudentNFT
 * @dev Minted to scholars after completing ALL milestones.
 *      Permanent academic credential on-chain.
 *      Metadata includes: program, education level, completion date.
 *
 *      NOTE: Only minted on FULL completion — not just on acceptance.
 *      This makes the NFT meaningful as a credential.
 */
contract StudentNFT is BaseCredentialNFT("ScholarshipGraduate", "SGNFT") {}
