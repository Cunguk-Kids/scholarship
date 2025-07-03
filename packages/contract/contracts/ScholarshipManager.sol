// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ScholarshipProgramDetails, ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ScholarshipProgram} from "./ScholarshipProgram.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {MilestoneInput} from "./ScholarshipStruct.sol";

contract ScholarshipManager is ReentrancyGuard, OwnableUpgradeable {
    uint256 public nextProgramId;
    mapping(uint256 => ScholarshipProgramDetails) public programs;
    address public immutable programImplementation;

    constructor(address _programImplementation) {
        programImplementation = _programImplementation;
    }

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
        program = ScholarshipProgram(
            payable(programs[id].programContractAddress)
        );
    }

    function getProgramData(
        uint256 id
    ) external view returns (ScholarshipProgram program) {
        if (id >= nextProgramId) revert ProgramNotFound();
        program = ScholarshipProgram(
            payable(programs[id].programContractAddress)
        );
    }

    function createProgram(
        string memory cid,
        uint256 target,
        uint256 start,
        uint256 end
    ) external {
        address clone = Clones.clone(programImplementation);
        ScholarshipProgram(payable(clone)).initialize(
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
            programContractAddress: clone
        });
        emit ProgramCreated(nextProgramId, clone, msg.sender);
        ++nextProgramId;
    }

    function getProgramDetails(
        uint256 id
    ) external view returns (ScholarshipProgramDetails memory) {
        return programs[id];
    }

    function donateToProgram(uint256 id) external payable {
        ScholarshipProgram program = _getProgram(id);
        if (program.appStatus() != ScholarshipStatus.OpenForApplications)
            revert NotAcceptingDonations();
        try program.donate{value: 0.1 ether}(msg.sender) {
            emit Donated(id, msg.sender, msg.value);
        } catch {
            revert DonationFailed();
        }
    }

    function applyToProgram(
        uint256 id,
        MilestoneInput[] calldata milestone
    ) external {
        _getProgram(id).applyProgram(msg.sender, milestone);
        emit Applied(id, msg.sender);
    }

    function voteApplicant(uint256 id, address applicant) external {
        _getProgram(id).vote(msg.sender, applicant);
    }

    function getContractBalance(uint256 id) external view returns (uint256) {
        ScholarshipProgram program = _getProgram(id);
        return address(program).balance;
    }

    function getAllPrograms()
        external
        view
        returns (ScholarshipProgramDetails[] memory list)
    {
        list = new ScholarshipProgramDetails[](nextProgramId);
        for (uint256 i; i < nextProgramId; ) {
            list[i] = programs[i];
            unchecked {
                ++i;
            }
        }
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

    function closeDonation(uint256 id) external onlyOwner {
        _getProgram(id).closeDonation();
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
