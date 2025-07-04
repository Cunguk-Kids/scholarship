// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ScholarshipDonaterNFT} from "./ScholarshipDonaterNFT.sol";
import {ScholarshipStudentNFT} from "./ScholarshipStudentNFT.sol";

contract ScholarshipNFTMintingManager {
    ScholarshipDonaterNFT donaterNFTAddress;
    ScholarshipStudentNFT studentNFTAddress;

    mapping(uint => mapping(address => bool)) isDonaterMinted;
    mapping(uint => mapping(address => bool)) isStudentMinted;

    mapping(uint => mapping(address => bool)) allowedStudentToMint;
    mapping(uint => mapping(address => bool)) allowedDonaterToMint;

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

    function _setAllowedStudentToMint(address student, uint batchId) internal {
        allowedStudentToMint[batchId][student] = true;
    }

    function _setAllowedDonaterToMint(address donater, uint batchId) internal {
        allowedDonaterToMint[batchId][donater] = true;
    }

    function mintStudentNFT(string calldata uri, uint batchId) external {
        if (isStudentMinted[batchId][msg.sender]) revert AlreadyMint();
        if (!allowedStudentToMint[batchId][msg.sender]) revert NotAllowedToMint();
        _mintForStudent(uri);
        isStudentMinted[batchId][msg.sender] = true;
    }

    function mintDonaterNFT(string calldata uri, uint batchId) external {
        if (isDonaterMinted[batchId][msg.sender]) revert AlreadyMint();
        if (!allowedDonaterToMint[batchId][msg.sender]) revert NotAllowedToMint();
        _mintForDonater(uri);
        isDonaterMinted[batchId][msg.sender] = true;
    }
}
