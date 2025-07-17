// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ScholarshipDonaterNFT} from "./ScholarshipDonaterNFT.sol";
import {ScholarshipStudentNFT} from "./ScholarshipStudentNFT.sol";

contract ScholarshipNFTMintingManager {
    ScholarshipDonaterNFT donaterNFTAddress;
    ScholarshipStudentNFT studentNFTAddress;

    mapping(address => bool) isDonaterMinted;
    mapping(address => bool) isStudentMinted;

    mapping(address => bool) allowedStudentToMint;
    mapping(address => bool) allowedDonaterToMint;

    error NotAllowedToMint();
    error AlreadyMint();

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

    function _setAllowedStudentToMint(address student) internal {
        allowedStudentToMint[student] = true;
    }

    function _setAllowedDonaterToMint(address donater) internal {
        allowedDonaterToMint[donater] = true;
    }

    function mintStudentNFT(string calldata uri) external {
        if (isStudentMinted[msg.sender]) revert AlreadyMint();
        if (!allowedStudentToMint[msg.sender]) revert NotAllowedToMint();
        _mintForStudent(uri);
        isStudentMinted[msg.sender] = true;
    }

    function mintDonaterNFT(string calldata uri) external {
        if (isDonaterMinted[msg.sender]) revert AlreadyMint();
        if (!allowedDonaterToMint[msg.sender]) revert NotAllowedToMint();
        _mintForDonater(uri);
        isDonaterMinted[msg.sender] = true;
    }
}
