// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ScholarshipAccessControl is AccessControl {
    bytes32 public constant VOTE_CONTROL = keccak256("VOTE_CONTROL");
    bytes32 public constant PROGRAM_CONTROL = keccak256("PROGRAM_CONTROL");

    constructor() {
        _grantRole(VOTE_CONTROL, msg.sender);
        _grantRole(PROGRAM_CONTROL, msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}

contract BaseNFT is AccessControl, ERC721, ERC721URIStorage {
    error AlreadyMinted();

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC721(_tokenName, _tokenSymbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(
        uint256 id,
        address to,
        string calldata metadataURI
    ) public onlyRole(MINTER_ROLE) {
        if (_ownerOf(id) != address(0x0)) revert AlreadyMinted();
        _mint(to, id);
        _setTokenURI(id, metadataURI);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, AccessControl, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}

contract ApplicantNFT is BaseNFT("ScholarshipApplicant", "SCAP") {}

contract ProgramCreatorNFT is BaseNFT("ProgramCreator", "PGCT") {}

contract ScholarshipManagerV2 is ScholarshipAccessControl, ReentrancyGuard {
    uint256 constant MILESTONE_APPROVE_DEADLINE = 2 days;
    uint256 constant MINIMAL_FUND = 100 * 10 ** 6; // 10 coin we assume using usdc;

    // remove after code fix
    enum ProgramStatus {
        Undefined,
        InApplicant,
        InVoting,
        InOnGoing,
        InClosed
    }

    // remove after code fix
    enum MilestoneStatus {
        Undefined,
        InReviewDeadline
    }

    enum MilestoneAllocation {
        Fixed,
        UserDefined
    }

    struct Program {
        uint256 id;
        uint256 openedAt;
        uint256 votingAt;
        uint256 closedAt;
        uint256 ongoingAt;
        uint256 totalFund;
        address creator;
        MilestoneAllocation allocation;
        string metadataCID;
        uint256 studentApplied;
        // remove after codefix
        ProgramStatus status;
        uint256 spendedFund;
    }

    struct Milestone {
        uint256 id;
        uint256 programId;
        address creator;
        uint256 amount;
        string metadataCID;
        string proveCID;
        uint256 withdrawedAt;
        uint256 submitedAt;
        uint256 approvedAt;
        MilestoneStatus status;
    }

    struct Applicant {
        uint256 id;
        uint256 programId;
        uint256 totalVote;
        string metadataCID;
        uint256 milestoneLength;
        uint256 completedMilestone;
        address addr;
        bool alreadyWithdraw;
    }

    struct InputMilestone {
        uint256 amount;
        string metadataCID;
    }

    event ProgramCreated(
        uint256 indexed id,
        uint256 totalFund,
        address creator,
        MilestoneAllocation allocation,
        string metadataCID
    );
    event ApplicantRegistered(
        uint256 indexed id,
        uint256 programId,
        address applicantAddress,
        string metadataCID
    );
    event OnVoted(address voter, uint256 programId, address applicant);
    event MilestoneAdded(
        uint256 indexed id,
        uint256 programId,
        address creator,
        uint256 amount,
        string metadataCID
    );
    event SubmitMilestone(uint256 milestoneId, string proveCID);
    event ApproveMilestone(uint256 milestoneId);
    event WithdrawMilestone(uint256 programId, uint256 applicantId);

    error OnlyValidProgram();
    error OnlyOnVoting();
    error OnlyNotVoted();
    error OnlyApplicantOrProgramCreator();
    error CanOnlyWithdrawOnDeadline();
    error WithdrawMilestoneOnlyWorkOnFixedAllocation();
    error MilestoneNotAllCompleted();
    error AlreadyVoted();
    error ProgramNotOpen();
    error ProgramNotOngoing();
    error OnlyValidMilestone();
    error AlreadyApplied();
    error OnlyMilestoneCreator();
    error OnlyApplicant();
    error OnlyProgramCreator();
    error OnlyMintIfMilestoneCompleted();
    error ProgramNotClosed();
    error NotOnMinimalFund();
    error CannotCreateProgramInThePast();
    error DateIsNotSequential();
    error MilestoneAlreadyApproved();
    error ApplicantAlreadyWithdrawFund();
    error MilestoneCannotEmpty();
    error CannotApplyToSelfProgram();
    error MilestoneAlreadyOnSubmit();

    IERC20 scholarshipToken;
    BaseNFT applicantNFT;
    BaseNFT programCreatorNFT;

    uint256 _nextProgramId;
    uint256 _nextApplicantId;
    uint256 _nextMilestoneId;

    mapping(uint256 => Program) programs;
    mapping(uint256 => Applicant) programApplicants;
    mapping(uint256 => Milestone) applicantMilestones;
    mapping(uint256 => mapping(address => uint256)) addressToApplicant;
    mapping(uint256 => mapping(address => bool)) isVoted;

    constructor(
        address _erc20Address,
        address _applicantNFTAddress,
        address _programCreatorNFTAddresss
    ) {
        applicantNFT = BaseNFT(_applicantNFTAddress);
        programCreatorNFT = BaseNFT(_programCreatorNFTAddresss);
        scholarshipToken = IERC20(_erc20Address);
    }

    modifier onlyValidProgram(uint256 id) {
        _onlyValidProgram(id);
        _;
    }

    modifier onlyNotVoted(uint256 programId, address voter) {
        _onlyNotVoted(programId, voter);
        _;
    }

    modifier onlyProgramOpen(uint256 programId) {
        _onlyProgramOpen(programId);
        _;
    }

    modifier onlyVotingPeriod(uint256 programId) {
        _onlyVotingPeriod(programId);
        _;
    }

    modifier onlyValidMilestone(uint256 id) {
        _onlyValidMilestone(id);
        _;
    }

    modifier onlyOngoing(uint256 programId) {
        _onlyOnGoing(programId);
        _;
    }

    function _onlyValidMilestone(uint256 id) internal view {
        if (id == 0 || id > _nextMilestoneId) revert OnlyValidMilestone();
    }

    function _onlyOnGoing(
        uint256 programId
    ) internal view returns (bool isOngoing) {
        Program memory program = programs[programId];
        // remove after codefix
        if (program.status == ProgramStatus.InOnGoing) return true;
        if (block.timestamp < program.ongoingAt) revert ProgramNotOngoing();
    }

    function _onlyVotingPeriod(
        uint256 programId
    ) internal view returns (bool isOnlyVotingPeiod) {
        Program memory program = programs[programId];
        // remove after codefix
        if (program.status == ProgramStatus.InVoting) return true;
        if (
            block.timestamp < program.votingAt ||
            block.timestamp >= program.closedAt
        ) revert OnlyOnVoting();
    }

    function _onlyProgramOpen(
        uint256 programId
    ) internal view returns (bool isOnlyProgramOpen) {
        Program memory program = programs[programId];
        if (program.status == ProgramStatus.InApplicant) return true;
        if (
            block.timestamp < program.openedAt ||
            block.timestamp >= program.votingAt
        ) revert ProgramNotOpen();
    }

    function _onlyValidProgram(uint256 id) internal view {
        // we start id on 1
        if (id == 0 || id > _nextProgramId) revert OnlyValidProgram();
    }

    function _onlyNotVoted(uint256 programId, address voter) internal view {
        if (isVoted[programId][voter]) revert AlreadyVoted();
    }

    function getProgram(uint256 id) public view returns (Program memory) {
        return programs[id];
    }

    function changeProgramStatus(
        uint256 id,
        ProgramStatus status
    ) public onlyValidProgram(id) onlyRole(PROGRAM_CONTROL) {
        Program storage program = programs[id];
        program.status = status;
    }

    function changeMilestoneStatus(
        uint256 id,
        MilestoneStatus status
    ) public onlyValidMilestone(id) onlyRole(PROGRAM_CONTROL) {
        Milestone storage milestone = applicantMilestones[id];
        milestone.status = status;
    }

    function createProgram(
        uint256 totalFund,
        uint256[4] calldata dates,
        string calldata metadataCID,
        MilestoneAllocation allocation
    ) external {
        if (dates[0] < block.timestamp) revert CannotCreateProgramInThePast();
        if (
            !(dates[0] < dates[1] && dates[1] < dates[2] && dates[2] < dates[3])
        ) revert DateIsNotSequential();
        // transfer token from sender to this contract
        scholarshipToken.transferFrom(msg.sender, address(this), totalFund);

        // Increase Program ID
        _nextProgramId += 1;

        // check if total fund < minimal
        if (totalFund < MINIMAL_FUND) revert NotOnMinimalFund();

        // create On Storage Program
        Program memory program = Program({
            id: _nextProgramId,
            metadataCID: metadataCID,
            openedAt: dates[0],
            votingAt: dates[1],
            ongoingAt: dates[2],
            closedAt: dates[3],
            totalFund: totalFund,
            creator: msg.sender,
            studentApplied: 0,
            allocation: allocation,
            status: ProgramStatus.Undefined,
            spendedFund: 0
        });

        programs[_nextProgramId] = program;

        // emit the program to catch by indexer
        emit ProgramCreated(
            _nextProgramId,
            totalFund,
            msg.sender,
            allocation,
            metadataCID
        );
    }

    function applyAppplicant(
        uint256 programId,
        InputMilestone[] calldata milestones,
        string calldata metadataCID
    ) external onlyValidProgram(programId) onlyProgramOpen(programId) {
        if (milestones.length < 1) revert MilestoneCannotEmpty();
        if (addressToApplicant[programId][msg.sender] != 0)
            revert AlreadyApplied();
        if (programs[programId].creator == msg.sender) revert CannotApplyToSelfProgram();

        // Increase Applicant ID
        _nextApplicantId += 1;

        // define applicant
        Applicant memory applicant = Applicant({
            id: _nextApplicantId,
            programId: programId,
            totalVote: 0,
            metadataCID: metadataCID,
            milestoneLength: milestones.length,
            completedMilestone: 0,
            addr: msg.sender,
            alreadyWithdraw: false
        });

        // add student applied
        programs[programId].studentApplied += 1;

        // add address to applicant by program id
        addressToApplicant[programId][msg.sender] = applicant.id;

        // add applicant to programApplicants
        programApplicants[_nextApplicantId] = applicant;

        // implement milestones
        _inputMilestone(programId, milestones);

        //emit event
        emit ApplicantRegistered(_nextApplicantId, programId, msg.sender, metadataCID);
    }

    function _inputMilestone(
        uint256 programId,
        InputMilestone[] calldata milestones
    ) internal {
        // we loop the input
        for (uint256 i = 0; i < milestones.length; i += 1) {
            // get the input
            InputMilestone calldata inputMilestone = milestones[i];

            // increase the next milestone
            _nextMilestoneId += 1;

            // assign the milestone to chain
            applicantMilestones[_nextMilestoneId] = Milestone({
                id: _nextMilestoneId,
                programId: programId,
                creator: msg.sender,
                amount: inputMilestone.amount,
                metadataCID: inputMilestone.metadataCID,
                proveCID: "",
                withdrawedAt: 0,
                approvedAt: 0,
                submitedAt: 0,
                status: MilestoneStatus.Undefined
            });

            // emit the event
            emit MilestoneAdded(
                _nextMilestoneId,
                programId,
                msg.sender,
                inputMilestone.amount,
                inputMilestone.metadataCID
            );
        }
    }

    function voteApplicant(
        uint256 programId,
        address voter,
        address applicantAddress
    )
        public
        onlyValidProgram(programId)
        onlyNotVoted(programId, voter)
        onlyRole(VOTE_CONTROL)
        onlyVotingPeriod(programId)
    {
        // get the applicant
        Applicant storage applicant = programApplicants[
            addressToApplicant[programId][applicantAddress]
        ];

        // add total vote to applicant
        applicant.totalVote += 1;

        // voted
        isVoted[programId][voter] = true;

        // emit event
        emit OnVoted(voter, programId, applicantAddress);
    }

    function submitMilestone(
        uint256 milestoneId,
        string calldata proveCID
    ) public onlyValidMilestone(milestoneId) {
        // get the milestone
        Milestone storage milestone = applicantMilestones[milestoneId];

        // check if the program in status on going
        _onlyOnGoing(milestone.programId);

        if (milestone.submitedAt != 0) revert MilestoneAlreadyOnSubmit();

        if (msg.sender != milestone.creator) revert OnlyMilestoneCreator();

        // assign the prove
        milestone.proveCID = proveCID;

        // assign submited at
        milestone.submitedAt = block.timestamp;

        emit SubmitMilestone(milestoneId, proveCID);
    }

    function approveMilestone(uint256 milestoneId) public nonReentrant {
        Milestone storage milestone = applicantMilestones[milestoneId];
        Program storage program = programs[milestone.programId];
        Applicant storage applicant = programApplicants[
            addressToApplicant[program.id][milestone.creator]
        ];

        if (milestone.approvedAt != 0) revert MilestoneAlreadyApproved();

        // revert if function called by non mvp
        if (msg.sender != milestone.creator && msg.sender != program.creator)
            revert OnlyApplicantOrProgramCreator();

        // if function called by applicant. applicant must wait for approve deadline
        // if program creator doesnt approved it
        if (
            msg.sender == milestone.creator &&
            block.timestamp <
            (milestone.submitedAt + MILESTONE_APPROVE_DEADLINE)
        ) {
            // remove after code fix
            if (milestone.status != MilestoneStatus.InReviewDeadline)
                revert CanOnlyWithdrawOnDeadline();
        }

        // add completed milestone
        applicant.completedMilestone += 1;

        // add timestamp approved
        milestone.approvedAt = block.timestamp;

        // transfer the fund if program allocation is user defined
        if (program.allocation == MilestoneAllocation.UserDefined) {
            scholarshipToken.transfer(milestone.creator, milestone.amount);
            program.spendedFund += milestone.amount;
            milestone.withdrawedAt = block.timestamp;
        }

        // emit the event
        emit ApproveMilestone(milestoneId);
    }

    function withdrawMilestone(uint256 programId) public nonReentrant {
        // check if function called by non applicant
        uint256 applicantId = addressToApplicant[programId][msg.sender];
        if (applicantId == 0) revert OnlyApplicant();

        Program storage program = programs[programId];
        Applicant storage applicant = programApplicants[applicantId];

        // check if applicant already withdraw
        if (applicant.alreadyWithdraw) revert ApplicantAlreadyWithdrawFund();

        // only work on fixed allocation
        if (program.allocation != MilestoneAllocation.Fixed)
            revert WithdrawMilestoneOnlyWorkOnFixedAllocation();

        // check if all milestone completed
        if (applicant.completedMilestone != applicant.milestoneLength)
            revert MilestoneNotAllCompleted();

        // division by student applied
        uint256 totalAmount = program.totalFund / program.studentApplied;

        // transfer the fund to applicant
        scholarshipToken.transfer(msg.sender, totalAmount);

        program.spendedFund += totalAmount;

        emit WithdrawMilestone(programId, applicant.id);
    }

    function mintProgramCreator(
        uint256 id,
        string calldata metadataCID
    ) public onlyValidProgram(id) onlyOngoing(id) nonReentrant {
        Program storage program = programs[id];
        if (program.creator != msg.sender) revert OnlyProgramCreator();
        programCreatorNFT.mint(id, msg.sender, metadataCID);
    }

    function mintApplicant(
        uint256 programId,
        string calldata metadataCID
    ) public nonReentrant {
        // check if function called by non applicant
        uint256 applicantId = addressToApplicant[programId][msg.sender];
        if (applicantId == 0) revert OnlyApplicant();
        Applicant memory applicant = programApplicants[applicantId];
        if (applicant.completedMilestone != applicant.milestoneLength)
            revert OnlyMintIfMilestoneCompleted();
        applicantNFT.mint(applicantId, msg.sender, metadataCID);
    }

    function recoverProgramFund(uint256 id) public onlyValidProgram(id) {
        Program storage program = programs[id];
        if (program.creator != msg.sender) revert OnlyProgramCreator();
        if (
            (block.timestamp >= program.closedAt) ||
            program.status == ProgramStatus.InClosed
        ) {
            uint256 remainder = program.totalFund - program.spendedFund;
            scholarshipToken.transfer(program.creator, remainder);
        } else {
            revert ProgramNotClosed();
        }
    }
}