// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ScholarshipProgramDetails, ScholarshipStatus} from "./ScholarshipStruct.sol";
import {ScholarshipProgram} from "./ScholarshipProgram.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {MilestoneInput, ProgramSummary} from "./ScholarshipStruct.sol";
import {ScholarshipNFTMintingManager} from "./ScholarshipNFTMintingManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ScholarshipManager is
    ReentrancyGuard,
    OwnableUpgradeable,
    ScholarshipNFTMintingManager
{
    uint256 public nextProgramId;
    mapping(uint256 => ScholarshipProgramDetails) public programs;
    address public immutable programImplementation;
    // contract program by user address
    mapping(address => address[]) public createdContractsByUser;
    mapping(address => uint[]) public appliedContractsByUser;
    
    // ERC20 token configuration
    IERC20 public donationToken;
    uint8 public tokenDecimals;

    constructor(
        address _programImplementation,
        address _donaterNFTAddress,
        address _studentNFTAddress,
        address _donationTokenAddress,
        uint8 _tokenDecimals
    ) ScholarshipNFTMintingManager(_donaterNFTAddress, _studentNFTAddress) {
        programImplementation = _programImplementation;
        donationToken = IERC20(_donationTokenAddress);
        tokenDecimals = _tokenDecimals;
    }

    error ProgramNotFound();
    error NotAcceptingDonations();
    error DonationFailed();
    error TokenTransferFailed();
    error InsufficientTokenBalance();
    error InsufficientAllowance();

    event ProgramCreated(
        uint256 indexed id,
        address programContract,
        address indexed initiator,
        string programMetadataCID,
        uint256 targetApplicant,
        uint256 startDate,
        uint256 endDate
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
            end,
            address(donationToken),
            tokenDecimals
        );

        programs[nextProgramId] = ScholarshipProgramDetails({
            id: nextProgramId,
            programContractAddress: clone,
            initiatorAddress: msg.sender,
            programMetadataCID: cid,
            targetApplicant: target,
            startDate: start,
            endDate: end
        });

        createdContractsByUser[msg.sender].push(clone);

        emit ProgramCreated(
            nextProgramId,
            clone,
            msg.sender,
            cid,
            target,
            start,
            end
        );
        ++nextProgramId;
    }

    function getProgramCreator() external view returns (address[] memory) {
        return createdContractsByUser[msg.sender];
    }

    function getProgramDetails(
        uint256 id
    ) external view returns (ScholarshipProgramDetails memory) {
        return programs[id];
    }

    function donateToProgram(uint256 id, uint256 amount) external {
        ScholarshipProgram program = _getProgram(id);
        if (program.appStatus() != ScholarshipStatus.OpenForApplications)
            revert NotAcceptingDonations();
            
        // Check if sender has enough tokens
        if (donationToken.balanceOf(msg.sender) < amount) {
            revert InsufficientTokenBalance();
        }
        
        // Check if contract has enough allowance
        if (donationToken.allowance(msg.sender, address(this)) < amount) {
            revert InsufficientAllowance();
        }
        
        // Transfer tokens from sender to this contract temporarily
        bool success = donationToken.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert TokenTransferFailed();
        }
        
        // Approve the program contract to spend tokens
        success = donationToken.approve(address(program), amount);
        if (!success) {
            revert TokenTransferFailed();
        }
        
        try program.donate(msg.sender, amount) {
            _setAllowedDonaterToMint(msg.sender);
            emit Donated(id, msg.sender, amount);
        } catch {
            revert DonationFailed();
        }
    }

    function applyToProgram(
        uint256 id,
        MilestoneInput[] calldata milestone
    ) external {
        _getProgram(id).applyProgram(msg.sender, milestone);
        _setAllowedStudentToMint(msg.sender);
        appliedContractsByUser[msg.sender].push(id);
        emit Applied(id, msg.sender);
    }

    function voteApplicant(uint256 id, address applicant) external {
        _getProgram(id).vote(msg.sender, applicant);
    }

    function getContractBalance(uint256 id) external view returns (uint256) {
        ScholarshipProgram program = _getProgram(id);
        return program.getBalance();
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

    function claimMilestone(
        uint256 id,
        uint256 milestone
    ) external {
        _getProgram(id).withrawMilestone(milestone);
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

    function getOpenProgramsSummaryPaged(
        uint256 offset,
        uint256 limit
    ) external view returns (ProgramSummary[] memory) {
        uint256 totalPrograms = nextProgramId;
        ProgramSummary[] memory temp = new ProgramSummary[](limit);
        uint256 count = 0;
        uint256 idx = 0;

        for (uint256 i = offset; i < totalPrograms && count < limit; i++) {
            ScholarshipProgram prog = ScholarshipProgram(
                payable(programs[idx].programContractAddress)
            );
            if (prog.getAppStatus() == ScholarshipStatus.OpenForApplications) {
                temp[count] = ProgramSummary({
                    programAddress: address(prog),
                    balance: prog.getBalance(),
                    applicants: prog.getApplicants(),
                    metadataCID: prog.programMetadataCID()
                });
                count++;
            }
            idx++;
        }

        ProgramSummary[] memory result = new ProgramSummary[](count);
        for (uint256 j = 0; j < count; j++) {
            result[j] = temp[j];
        }
        return result;
    }
    
    // Utility function to get token info
    function getTokenInfo() external view returns (address tokenAddress, uint8 decimals) {
        return (address(donationToken), tokenDecimals);
    }

    function getAppliedPrograms(address user) external view returns (uint256[] memory) {
        return appliedContractsByUser[user];
    }
}