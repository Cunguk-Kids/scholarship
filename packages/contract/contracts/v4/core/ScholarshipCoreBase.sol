// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ScholarshipTypes}       from "../libraries/ScholarshipTypes.sol";
import {IScholarshipTreasury}   from "../interfaces/IScholarship.sol";
import {IScholarshipReputation} from "../interfaces/IScholarship.sol";
import {ICredentialNFT}         from "../interfaces/IScholarship.sol";

abstract contract ScholarshipCoreBase is Initializable {
    using SafeERC20 for IERC20;

    // ── Inline ReentrancyGuard ───────────────────────────────────────────────
    uint256 private _reentrancyStatus;
    error Reentrancy();
    modifier nonReentrant() {
        if (_reentrancyStatus == 2) revert Reentrancy();
        _reentrancyStatus = 2;
        _;
        _reentrancyStatus = 1;
    }
    function _initReentrancy() internal { _reentrancyStatus = 1; }

    // ── Inline UUPS ──────────────────────────────────────────────────────────
    bytes32 private constant _IMPL_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    event Upgraded(address indexed implementation);
    function upgradeTo(address newImpl) external { _authorizeUpgrade(newImpl); assembly { sstore(_IMPL_SLOT, newImpl) } emit Upgraded(newImpl); }
    function _authorizeUpgrade(address) internal view virtual;

    // ── Minimal Role System ──────────────────────────────────────────────────
    bytes32 public constant UPGRADER_ROLE  = keccak256("UPGRADER_ROLE");
    bytes32 public constant BOUNTY_ROLE    = keccak256("BOUNTY_ROLE");
    bytes32 public constant COMMITTEE_ROLE = keccak256("COMMITTEE_ROLE");
    string  public constant VERSION        = "4.0.0";

    address public admin;
    mapping(bytes32 => mapping(address => bool)) internal _roles;

    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);

    error NotAdmin();
    error MissingRole(bytes32 role, address account);

    function grantRole(bytes32 role, address account) external { if (msg.sender != admin) revert NotAdmin(); _roles[role][account] = true; emit RoleGranted(role, account); }
    function revokeRole(bytes32 role, address account) external { if (msg.sender != admin) revert NotAdmin(); _roles[role][account] = false; emit RoleRevoked(role, account); }
    function hasRole(bytes32 role, address account) public view returns (bool) { return _roles[role][account]; }
    modifier onlyRole(bytes32 role) { if (!_roles[role][msg.sender]) revert MissingRole(role, msg.sender); _; }

    // ── External contracts ───────────────────────────────────────────────────
    IERC20                 public usdc;
    IScholarshipTreasury   public treasury;
    IScholarshipReputation public reputation;
    ICredentialNFT         public donorNFT;
    ICredentialNFT         public studentNFT;

    // ── Storage ──────────────────────────────────────────────────────────────
    uint256 internal _nextProgramId;
    uint256 internal _nextMilestoneId;

    mapping(uint256 => ScholarshipTypes.Program)                             public programs;
    mapping(uint256 => ScholarshipTypes.Milestone)                           public milestones;
    mapping(uint256 => mapping(address => ScholarshipTypes.Applicant))       public applicants;
    mapping(uint256 => address[])                                            internal _programApplicants;
    mapping(uint256 => address[])                                            internal _shortlist;
    mapping(address => mapping(uint256 => ScholarshipTypes.Scholar))         public scholars;
    mapping(address => ScholarshipTypes.StudentStatus)                       public globalStudentStatus;
    mapping(address => uint256)                                              public globalFreezeUntil;
    mapping(uint256 => mapping(address => ScholarshipTypes.ScoreComponents)) public scoreComponents;
    mapping(uint256 => mapping(address => ScholarshipTypes.VoterInfo))       public voterInfo;
    mapping(uint256 => mapping(address => uint8))                            public retryCount;
    mapping(uint256 => address)                                              public milestoneOwner;
    mapping(uint256 => address)                                              public programCommittee;

    // ── Events (only those emitted in Base) ──────────────────────────────────
    event VoteCast(uint256 indexed programId, address indexed voter, address indexed candidate, uint256 weight);
    event ConfidenceStaked(uint256 indexed programId, address indexed voter, address indexed scholar, uint256 amount);
    event ScholarSelected(uint256 indexed programId, address indexed scholar);
    event MilestoneSubmitted(uint256 indexed milestoneId, address indexed scholar, string proofCID);
    event MilestoneCompleted(uint256 indexed milestoneId, address indexed scholar, uint256 amount);
    event MilestoneFrozen(uint256 indexed milestoneId);
    event MilestoneReleased(uint256 indexed milestoneId);
    event ScholarSlashed(address indexed scholar, uint256 indexed programId, ScholarshipTypes.DisputeType dtype);
    event ScholarCompleted(uint256 indexed programId, address indexed scholar);
    event ProgramCompleted(uint256 indexed programId);
    event ProgramStatusChanged(uint256 indexed programId, ScholarshipTypes.ProgramStatus newStatus);

    // ── Errors (only those used in Base) ─────────────────────────────────────
    error ProgramNotFound();
    error InvalidProgramStatus(ScholarshipTypes.ProgramStatus expected, ScholarshipTypes.ProgramStatus actual);
    error StudentFrozen(uint256 freezeUntil);
    error StudentBlacklisted();
    error VotingPowerLocked();
    error InsufficientVotingPower();
    error CandidateNotShortlisted();
    error ConfidenceStakeAlreadyExists();
    error MustVoteBeforeStaking();
    error ConfidenceStakeMismatch();
    error ConfidenceStakeExceedsDonation();
    error VotingNotEnded();
    error QuorumNotMet();
    error InvalidSortOrder();
    error OnlyInitiator();
    error MilestoneNotFound();
    error MilestoneNotInDisputeWindow();
    error NotMilestoneOwner();
    error ScholarNotActive();
    error DisputeWindowStillOpen();

    // ── Modifiers ────────────────────────────────────────────────────────────
    modifier programExists(uint256 programId) { if (programId == 0 || programId > _nextProgramId) revert ProgramNotFound(); _; }
    modifier inStatus(uint256 programId, ScholarshipTypes.ProgramStatus expected) {
        if (programs[programId].status != expected) revert InvalidProgramStatus(expected, programs[programId].status);
        _;
    }
    modifier onlyInitiator(uint256 programId) { if (msg.sender != programs[programId].initiator) revert OnlyInitiator(); _; }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 3 — VOTING
    // ═══════════════════════════════════════════════════════════════════
    function voteForCandidate(uint256 programId, address candidate)
        external nonReentrant programExists(programId) inStatus(programId, ScholarshipTypes.ProgramStatus.VOTING)
    {
        if (reputation.isVotingPowerLocked(msg.sender)) revert VotingPowerLocked();
        ScholarshipTypes.VoterInfo storage voter = voterInfo[programId][msg.sender];
        if (voter.remainingVotingPower == 0) revert InsufficientVotingPower();
        if (applicants[programId][candidate].status != ScholarshipTypes.ApplicationStatus.SHORTLISTED) revert CandidateNotShortlisted();
        uint256 weight = voter.remainingVotingPower;
        voter.remainingVotingPower = 0;
        voter.votedFor = candidate;
        applicants[programId][candidate].voteScore += weight;
        emit VoteCast(programId, msg.sender, candidate, weight);
    }

    function placeConfidenceStake(uint256 programId, address scholar, uint256 amount)
        external nonReentrant programExists(programId) inStatus(programId, ScholarshipTypes.ProgramStatus.VOTING)
    {
        ScholarshipTypes.VoterInfo storage voter = voterInfo[programId][msg.sender];
        if (voter.confidenceStake > 0)    revert ConfidenceStakeAlreadyExists();
        if (voter.votedFor == address(0)) revert MustVoteBeforeStaking();
        if (voter.votedFor != scholar)    revert ConfidenceStakeMismatch();
        if (amount > voter.donatedAmount) revert ConfidenceStakeExceedsDonation();
        usdc.safeTransferFrom(msg.sender, address(treasury), amount);
        treasury.depositConfidenceStake(programId, msg.sender, scholar, amount);
        voter.confidenceStake = amount;
        voter.confidenceStakeFor = scholar;
        emit ConfidenceStaked(programId, msg.sender, scholar, amount);
    }

    function selectWinners(uint256 programId, address[] calldata ranked, uint256[][] calldata amounts)
        external programExists(programId) onlyInitiator(programId)
    {
        _requireStatus(programId, ScholarshipTypes.ProgramStatus.VOTING);
        ScholarshipTypes.Program storage prog = programs[programId];
        if (block.timestamp < prog.votingEnd) revert VotingNotEnded();
        if (_computeTotalVotingCast(programId) * 100 < treasury.programTotalDonated(programId) * ScholarshipTypes.QUORUM_PERCENT) revert QuorumNotMet();
        uint256 n = ranked.length < prog.targetWinners ? ranked.length : prog.targetWinners;
        for (uint256 i = 0; i < n - 1; ) { if (applicants[programId][ranked[i]].voteScore < applicants[programId][ranked[i+1]].voteScore) revert InvalidSortOrder(); unchecked{++i;} }
        for (uint256 i = 0; i < n; ) { _activateScholar(programId, ranked[i], amounts[i]); unchecked{++i;} }
        prog.status = ScholarshipTypes.ProgramStatus.ACTIVE;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.ACTIVE);
    }

    function _computeTotalVotingCast(uint256 programId) internal view returns (uint256 cast) {
        address[] memory donors = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < donors.length; ) { if (voterInfo[programId][donors[i]].votedFor != address(0)) cast += voterInfo[programId][donors[i]].donatedAmount; unchecked{++i;} }
    }

    function _activateScholar(uint256 programId, address winner, uint256[] memory amt) internal {
        scholars[winner][programId] = ScholarshipTypes.Scholar({ programId: programId, wallet: winner, status: ScholarshipTypes.StudentStatus.ACTIVE, freezeUntil: 0, isBlacklisted: false, currentMilestone: 0, totalMilestones: amt.length, totalReceived: 0 });
        programs[programId].activeScholarCount++;
        programs[programId].allocatedFund += _sumArray(amt);
        for (uint256 j = 0; j < amt.length; ) {
            uint256 mId = ++_nextMilestoneId;
            milestones[mId] = ScholarshipTypes.Milestone({ id: mId, programId: programId, scholar: winner, amount: amt[j], descriptionCID: "", proofCID: "", status: ScholarshipTypes.MilestoneStatus.PENDING, submittedAt: 0, disputeDeadline: 0, completedAt: 0, isFirstMilestone: j == 0 });
            milestoneOwner[mId] = winner;
            unchecked{++j;}
        }
        emit ScholarSelected(programId, winner);
    }

    function _sumArray(uint256[] memory arr) internal pure returns (uint256 s) { for (uint256 i = 0; i < arr.length; ) { s += arr[i]; unchecked{++i;} } }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 4 — MILESTONES
    // ═══════════════════════════════════════════════════════════════════
    function submitMilestoneProof(uint256 milestoneId, string calldata proofCID) external nonReentrant {
        ScholarshipTypes.Milestone storage m = milestones[milestoneId];
        if (m.scholar == address(0)) revert MilestoneNotFound();
        if (msg.sender != m.scholar) revert NotMilestoneOwner();
        if (m.status != ScholarshipTypes.MilestoneStatus.PENDING) revert MilestoneNotInDisputeWindow();
        if (scholars[msg.sender][m.programId].status != ScholarshipTypes.StudentStatus.ACTIVE) revert ScholarNotActive();
        m.proofCID = proofCID; m.status = ScholarshipTypes.MilestoneStatus.SUBMITTED;
        m.submittedAt = block.timestamp; m.disputeDeadline = block.timestamp + programs[m.programId].milestoneDisputeWindow;
        emit MilestoneSubmitted(milestoneId, msg.sender, proofCID);
    }

    function executeMilestone(uint256 milestoneId) external nonReentrant {
        ScholarshipTypes.Milestone storage m = milestones[milestoneId];
        if (m.status != ScholarshipTypes.MilestoneStatus.SUBMITTED) revert MilestoneNotInDisputeWindow();
        if (block.timestamp < m.disputeDeadline) revert DisputeWindowStillOpen();
        _completeMilestone(milestoneId);
    }

    function _completeMilestone(uint256 milestoneId) internal {
        ScholarshipTypes.Milestone storage m = milestones[milestoneId];
        m.status = ScholarshipTypes.MilestoneStatus.COMPLETED; m.completedAt = block.timestamp;
        ScholarshipTypes.Scholar storage s = scholars[m.scholar][m.programId];
        s.currentMilestone++; s.totalReceived += m.amount; programs[m.programId].spentFund += m.amount;
        treasury.disburseMilestone(m.scholar, m.programId, milestoneId, m.amount);
        _rewardVotersOf(m.programId, m.scholar, 10, "ms_done");
        emit MilestoneCompleted(milestoneId, m.scholar, m.amount);
        if (s.currentMilestone == s.totalMilestones) _completeScholar(m.programId, m.scholar);
    }

    function _completeScholar(uint256 programId, address scholarAddr) internal {
        scholars[scholarAddr][programId].status = ScholarshipTypes.StudentStatus.COMPLETED;
        globalStudentStatus[scholarAddr] = ScholarshipTypes.StudentStatus.COMPLETED;
        _rewardVotersOf(programId, scholarAddr, 50, "sc_done");
        _resolveConfidenceStakesFor(programId, scholarAddr, true);
        studentNFT.mint(scholarAddr, programId, "");
        emit ScholarCompleted(programId, scholarAddr);
        if (_allScholarsCompleted(programId)) { programs[programId].status = ScholarshipTypes.ProgramStatus.COMPLETED; treasury.distributeYield(programId); emit ProgramCompleted(programId); }
    }

    function _allScholarsCompleted(uint256 programId) internal view returns (bool) {
        address[] memory sl = _shortlist[programId];
        for (uint256 i = 0; i < sl.length; ) { ScholarshipTypes.Scholar storage s = scholars[sl[i]][programId]; if (s.totalMilestones > 0 && s.status != ScholarshipTypes.StudentStatus.COMPLETED && s.status != ScholarshipTypes.StudentStatus.FROZEN && s.status != ScholarshipTypes.StudentStatus.BLACKLISTED) return false; unchecked{++i;} }
        return true;
    }

    function freezeMilestone(uint256 milestoneId) external onlyRole(BOUNTY_ROLE) { milestones[milestoneId].status = ScholarshipTypes.MilestoneStatus.FROZEN; emit MilestoneFrozen(milestoneId); }

    function releaseMilestone(uint256 milestoneId) external onlyRole(BOUNTY_ROLE) {
        ScholarshipTypes.Milestone storage m = milestones[milestoneId];
        m.status = ScholarshipTypes.MilestoneStatus.SUBMITTED; m.disputeDeadline = block.timestamp + programs[m.programId].milestoneDisputeWindow;
        emit MilestoneReleased(milestoneId);
    }

    function slashScholar(address wallet, uint256 programId, ScholarshipTypes.DisputeType disputeType) external onlyRole(BOUNTY_ROLE) {
        ScholarshipTypes.Scholar storage scholar = scholars[wallet][programId];
        scholar.status = ScholarshipTypes.StudentStatus.FROZEN;
        uint256 fd; bool bl = false;
        if (disputeType == ScholarshipTypes.DisputeType.LIGHT_FRAUD) fd = ScholarshipTypes.FREEZE_LIGHT;
        else if (disputeType == ScholarshipTypes.DisputeType.MILESTONE_FRAUD) fd = ScholarshipTypes.FREEZE_MILESTONE;
        else { fd = ScholarshipTypes.FREEZE_HEAVY; bl = true; }
        globalFreezeUntil[wallet] = block.timestamp + fd;
        globalStudentStatus[wallet] = bl ? ScholarshipTypes.StudentStatus.BLACKLISTED : ScholarshipTypes.StudentStatus.FROZEN;
        if (bl) scholar.isBlacklisted = true;
        uint256 rp = disputeType == ScholarshipTypes.DisputeType.LIGHT_FRAUD ? 50 : disputeType == ScholarshipTypes.DisputeType.MILESTONE_FRAUD ? 100 : 200;
        _punishVotersOf(programId, wallet, rp, block.timestamp + fd);
        _resolveConfidenceStakesFor(programId, wallet, false);
        emit ScholarSlashed(wallet, programId, disputeType);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    function _rewardVotersOf(uint256 programId, address scholarAddr, uint256 rep, string memory reason) internal {
        address[] memory donors = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < donors.length; ) { if (voterInfo[programId][donors[i]].votedFor == scholarAddr) reputation.mint(donors[i], rep, reason); unchecked{++i;} }
    }

    function _punishVotersOf(uint256 programId, address scholarAddr, uint256 rep, uint256 lockUntil) internal {
        address[] memory donors = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < donors.length; ) { if (voterInfo[programId][donors[i]].votedFor == scholarAddr) { reputation.burn(donors[i], rep, "slashed"); reputation.lockVotingPower(donors[i], lockUntil); } unchecked{++i;} }
    }

    function _resolveConfidenceStakesFor(uint256 programId, address scholarAddr, bool succeeded) internal {
        address[] memory donors = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < donors.length; ) { ScholarshipTypes.VoterInfo storage vi = voterInfo[programId][donors[i]]; if (vi.confidenceStakeFor == scholarAddr && vi.confidenceStake > 0) treasury.resolveConfidenceStake(programId, donors[i], succeeded); unchecked{++i;} }
    }

    function _requireStudentEligible(address wallet) internal view {
        ScholarshipTypes.StudentStatus status = globalStudentStatus[wallet];
        if (status == ScholarshipTypes.StudentStatus.BLACKLISTED) revert StudentBlacklisted();
        if (status == ScholarshipTypes.StudentStatus.FROZEN && block.timestamp < globalFreezeUntil[wallet]) revert StudentFrozen(globalFreezeUntil[wallet]);
    }

    function _requireStatus(uint256 programId, ScholarshipTypes.ProgramStatus expected) internal view {
        if (programs[programId].status != expected) revert InvalidProgramStatus(expected, programs[programId].status);
    }

    // ── Views ────────────────────────────────────────────────────────────────
    function getProgram(uint256 id) external view returns (ScholarshipTypes.Program memory) { return programs[id]; }
    function getScholar(address w, uint256 id) external view returns (ScholarshipTypes.Scholar memory) { return scholars[w][id]; }
    function getMilestone(uint256 id) external view returns (ScholarshipTypes.Milestone memory) { return milestones[id]; }
    function getShortlist(uint256 id) external view returns (address[] memory) { return _shortlist[id]; }
    function getProgramApplicants(uint256 id) external view returns (address[] memory) { return _programApplicants[id]; }
    function getRemainingFund(address, uint256 id) external view returns (uint256) { return treasury.getProgramBalance(id); }
    function isStudentEligible(address wallet) external view returns (bool, string memory) {
        ScholarshipTypes.StudentStatus s = globalStudentStatus[wallet];
        if (s == ScholarshipTypes.StudentStatus.BLACKLISTED) return (false, "blacklisted");
        if (s == ScholarshipTypes.StudentStatus.FROZEN && block.timestamp < globalFreezeUntil[wallet]) return (false, "frozen");
        return (true, "");
    }
}
