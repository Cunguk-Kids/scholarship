// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ScholarshipProgramDetails, ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ScholarshipProgram} from "./ScholarshipProgram.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ScholarshipManager is ReentrancyGuard, Ownable(msg.sender) {
    uint256 public nextProgramId;
    mapping(uint256 => ScholarshipProgramDetails) public programs;

    error ProgramNotFound();
    error NotAcceptingDonations();
    error DonationFailed();

    event ProgramCreated(
        uint256 indexed id,
        address programContract,
        address indexed initiator
    );
    event Donated(
        uint256 indexed programId,
        address indexed donor,
        uint256 amount
    );
    event Applied(uint256 indexed programId, address indexed applicant);
    event MilestoneClaimed(
        uint256 indexed programId,
        uint256 milestoneId,
        address user
    );

    function _getProgram(
        uint256 id
    ) internal view returns (ScholarshipProgram program) {
        if (id >= nextProgramId) revert ProgramNotFound();
        program = ScholarshipProgram(programs[id].programContractAddress);
    }

    function createProgram(
        string memory cid,
        uint256 target,
        uint256 start,
        uint256 end
    ) external {
        ScholarshipProgram newProgram = new ScholarshipProgram(
            cid,
            msg.sender,
            target,
            start,
            end
        );
        programs[nextProgramId] = ScholarshipProgramDetails({
            id: nextProgramId,
            initiatorAddress: msg.sender,
            programMetadataCID: cid,
            targetApplicant: target,
            startDate: start,
            endDate: end,
            programContractAddress: address(newProgram)
        });
        emit ProgramCreated(nextProgramId, address(newProgram), msg.sender);
        ++nextProgramId;
    }

    function donateToProgram(uint256 id) external payable {
        ScholarshipProgram program = _getProgram(id);
        if (program.appStatus() != ScholarshipStatus.VotingOpen)
            revert NotAcceptingDonations();
        (bool success, ) = address(program).call{value: msg.value}(
            abi.encodeWithSignature("donate()")
        );
        if (!success) revert DonationFailed();
        emit Donated(id, msg.sender, msg.value);
    }

    function applyToProgram(
        uint256 id,
        uint256[] calldata milestoneIds
    ) external {
        _getProgram(id).applyProgram(milestoneIds);
        emit Applied(id, msg.sender);
    }

    function voteApplicant(uint256 id, address applicant) external {
        _getProgram(id).vote(applicant);
    }

    function getAllPrograms()
        external
        view
        returns (ScholarshipProgramDetails[] memory list)
    {
        list = new ScholarshipProgramDetails[](nextProgramId);
        for (uint256 i = 0; i < nextProgramId; ++i) list[i] = programs[i];
    }

    function startApplication(uint256 id, uint256 target) external onlyOwner {
        _getProgram(id).startApplication(target);
    }

    function openVote(uint256 id) external onlyOwner {
        _getProgram(id).openVote();
    }

    function closeBatch(uint256 id) external onlyOwner {
        _getProgram(id).closeBatch();
    }

    function openDonation(uint256 id) external onlyOwner {
        _getProgram(id).openDonation();
    }

    function claimMilestone(
        uint256 id,
        uint256 batch,
        uint256 milestone,
        string calldata metadata
    ) external {
        _getProgram(id).withrawMilestone(batch, milestone, metadata);
        emit MilestoneClaimed(id, milestone, msg.sender);
    }

    function getApplicants(
        uint256 id
    ) external view returns (address[] memory) {
        return _getProgram(id).getApplicants();
    }

    function getDonators(uint256 id) external view returns (address[] memory) {
        return _getProgram(id).getDonators();
    }

    function getProgramStatus(
        uint256 id
    ) external view returns (ScholarshipStatus) {
        return _getProgram(id).getAppStatus();
    }
}
