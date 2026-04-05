// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ScholarshipTypes}       from "../libraries/ScholarshipTypes.sol";
import {IScholarshipTreasury}   from "../interfaces/IScholarship.sol";
import {IScholarshipReputation} from "../interfaces/IScholarship.sol";
import {ICredentialNFT}         from "../interfaces/IScholarship.sol";
import {IMilestoneManager}      from "../interfaces/IScholarship.sol";
import {ScholarshipCoreBase}    from "./ScholarshipCoreBase.sol";

/**
 * @title  ScholarshipCore v5
 * @notice Entry-point contract. Inherits voting, scholar activation,
 *         and milestone callbacks from ScholarshipCoreBase.
 *
 * @dev    EIP-170 compliance: administrative and date management functions
 *         are restricted to the GOVERNANCE_ROLE and typically called via
 *         the ScholarshipAdmin contract to save bytecode space here.
 */
contract ScholarshipCore is ScholarshipCoreBase {
    using SafeERC20 for IERC20;

    // ── Events ────────────────────────────────────────────────────────────────
    event ProgramCreated(uint256 indexed programId, address indexed initiator, string metadataCID);
    event CommitteeAssigned(uint256 indexed programId, address committeeContract);
    event DonationReceived(uint256 indexed programId, address indexed donor, uint256 grossAmount, uint256 netAmount);
    event ProtocolFeeCollected(uint256 indexed programId, address indexed donor, uint256 feeAmount);
    event StudentApplied(uint256 indexed programId, address indexed student, uint8 retryCount);
    event StudentShortlisted(uint256 indexed programId, address indexed student, uint256 score);
    event StudentScreenedOut(uint256 indexed programId, address indexed student, uint256 score, bool locked);
    event ProgramCancelled(uint256 indexed programId);
    event OpenDonationToggled(uint256 indexed programId, bool open);

    // ── Errors ───────────────────────────────────────────────────────────────
    error InvalidScoreWeights();
    error InvalidSlashDistribution();
    error InvalidCandidateRange();
    error TargetWinnersExceedsMax();
    error InsufficientFund();
    error InsufficientDonation();
    error AlreadyDonated();
    error CannotApplyToOwnProgram();
    error MaxRetriesExceeded();
    error AlreadyApplied();
    error ApplicantListIncomplete();
    error InvalidMaxOptional();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function _authorizeUpgrade(address) internal view override {
        if (msg.sender != admin && !_roles[UPGRADER_ROLE][msg.sender]) revert NotAdmin();
    }

    function initialize(
        address _admin,
        address _usdc,
        address _treasury,
        address _reputation,
        address _donorNFT,
        address _studentNFT,
        address _milestoneManager,
        address _bountyHunter
    ) external initializer {
        _initReentrancy();
        _initConfig();
        admin            = _admin;
        _roles[UPGRADER_ROLE][_admin] = true;
        usdc             = IERC20(_usdc);
        treasury         = IScholarshipTreasury(_treasury);
        reputation       = IScholarshipReputation(_reputation);
        donorNFT         = ICredentialNFT(_donorNFT);
        studentNFT       = ICredentialNFT(_studentNFT);
        milestoneManager = IMilestoneManager(_milestoneManager);
        bountyHunter     = _bountyHunter;
        _roles[MILESTONE_ROLE][_milestoneManager] = true;
        if (_bountyHunter != address(0)) {
            _roles[BOUNTY_ROLE][_bountyHunter] = true;
        }
    }

    function setBounty(address _bounty) external {
        if (msg.sender != admin) revert NotAdmin();
        bountyHunter = _bounty;
        _roles[BOUNTY_ROLE][_bounty] = true;
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 0 — PROGRAM CREATION
    // ═══════════════════════════════════════════════════════════════════

    function createProgram(
        string calldata metadataCID,
        ScholarshipTypes.EducationLevel educationLevel,
        ScholarshipTypes.ScreeningMode  screeningMode,
        ScholarshipTypes.ScoreWeights   calldata weights,
        ScholarshipTypes.SlashDistribution calldata slashDist,
        uint8 maxCandidates,
        uint8 targetWinners,
        uint256[4] calldata timeline,
        uint256 milestoneDisputeWindow,
        uint256 totalFund,
        uint8   maxOptionalMilestones,
        address committeeContract
    ) external nonReentrant {
        { uint256 wSum = uint256(weights.academicWeight) + weights.incomeWeight + weights.essayWeight + weights.recommendWeight + weights.extracurricWeight; if (wSum != 100) revert InvalidScoreWeights(); }
        { uint256 sSum = uint256(slashDist.bountyHunterPercent) + slashDist.treasuryPercent + slashDist.protocolPercent; if (sSum != 100) revert InvalidSlashDistribution(); }
        if (maxCandidates < _config.minCandidates || maxCandidates > _config.maxCandidates) revert InvalidCandidateRange();
        if (targetWinners == 0 || targetWinners > maxCandidates) revert TargetWinnersExceedsMax();
        if (timeline[0] >= timeline[1] || timeline[2] >= timeline[3] || timeline[1] >= timeline[2]) revert InvalidTimeline();
        if (totalFund == 0) revert InsufficientFund();
        if (maxOptionalMilestones > _config.maxOptionalMilestones) revert InvalidMaxOptional();

        uint256 dw = (milestoneDisputeWindow < 7 days || milestoneDisputeWindow > 14 days) ? 7 days : milestoneDisputeWindow;
        usdc.safeTransferFrom(msg.sender, address(treasury), totalFund);
        uint256 pid = ++_nextProgramId;
        treasury.depositProgramFund(pid, totalFund);

        programs[pid] = ScholarshipTypes.Program({
            id:                    pid,
            initiator:             msg.sender,
            metadataCID:           metadataCID,
            educationLevel:        educationLevel,
            screeningMode:         screeningMode,
            status:                ScholarshipTypes.ProgramStatus.CREATED,
            scoreWeights:          weights,
            slashDist:             slashDist,
            maxCandidates:         maxCandidates,
            targetWinners:         targetWinners,
            applicationStart:      timeline[0],
            applicationEnd:        timeline[1],
            votingStart:           timeline[2],
            votingEnd:             timeline[3],
            milestoneDisputeWindow: dw,
            totalFund:             totalFund,
            allocatedFund:         0,
            spentFund:             0,
            yieldAccrued:          0,
            applicantCount:        0,
            shortlistedCount:      0,
            activeScholarCount:    0,
            maxOptionalMilestones: maxOptionalMilestones,
            totalVotes:            0,
            openDonation:          true // Default to true
        });

        if (committeeContract != address(0)) {
            programCommittee[pid] = committeeContract;
            milestoneManager.setProgramCommittee(pid, committeeContract);
            emit CommitteeAssigned(pid, committeeContract);
        }
        emit ProgramCreated(pid, msg.sender, metadataCID);
    }

    function resolveDisputeBH(uint256 disputeId) external onlyRole(COMMITTEE_ROLE) {
        (bool success, ) = bountyHunter.call(abi.encodeWithSignature("resolveDispute(uint256,bool)", disputeId, true));
        require(success, "Dispute resolution failed");
    }

    function resolveDisputeScholar(uint256 disputeId) external onlyRole(COMMITTEE_ROLE) {
        (bool success, ) = bountyHunter.call(abi.encodeWithSignature("resolveDispute(uint256,bool)", disputeId, false));
        require(success, "Dispute resolution failed");
    }

    // ── View Helpers (IScholarshipCore compatible) ───────────────────────────

    function getProgram(uint256 id) external view returns (ScholarshipTypes.Program memory) { return programs[id]; }
    function getShortlist(uint256 id) external view returns (address[] memory) { return _shortlist[id]; }
    function getProgramApplicants(uint256 id) external view returns (address[] memory) { return _programApplicants[id]; }

    function getScholar(address wallet, uint256 programId) external view returns (ScholarshipTypes.Scholar memory) {
        return scholars[wallet][programId];
    }

    function isStudentEligible(address wallet) external view returns (bool eligible, string memory reason) {
        ScholarshipTypes.StudentStatus s = globalStudentStatus[wallet];
        if (s == ScholarshipTypes.StudentStatus.BLACKLISTED) return (false, "BLACKLISTED");
        if (s == ScholarshipTypes.StudentStatus.FROZEN && block.timestamp < globalFreezeUntil[wallet]) return (false, "FROZEN");
        return (true, "");
    }

    function getRemainingFund(address wallet, uint256 programId) external view returns (uint256) {
        ScholarshipTypes.Scholar memory s = scholars[wallet][programId];
        ScholarshipTypes.Program memory p = programs[programId];
        return (p.totalFund / p.targetWinners) - s.totalReceived;
    }

    // ── Status transitions ───────────────────────────────────────────────────

    function openApplications(uint256 programId) external programExists(programId) onlyInitiator(programId) {
        _requireStatus(programId, ScholarshipTypes.ProgramStatus.CREATED);
        if (block.timestamp < programs[programId].applicationStart) revert TooEarly();
        programs[programId].status = ScholarshipTypes.ProgramStatus.APPLICATION_OPEN;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN);
    }

    function openScreening(uint256 programId) external programExists(programId) onlyInitiator(programId) {
        _requireStatus(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN);
        if (block.timestamp < programs[programId].applicationEnd) revert TooEarly();
        programs[programId].status = ScholarshipTypes.ProgramStatus.SCREENING;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.SCREENING);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 1 — DONATIONS
    // ═══════════════════════════════════════════════════════════════════

    function donate(uint256 programId, uint256 grossAmount, string calldata nftMetadataURI)
        external nonReentrant programExists(programId) inStatus(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN)
    {
        if (!programs[programId].openDonation) revert PublicParticipationDisabled();
        if (grossAmount < _config.minDonation) revert InsufficientDonation();
        ScholarshipTypes.VoterInfo storage voter = voterInfo[programId][msg.sender];
        if (voter.donatedAmount > 0) revert AlreadyDonated();
        usdc.safeTransferFrom(msg.sender, address(treasury), grossAmount);
        uint256 fee = _config.transactionFee;
        uint256 net = grossAmount - fee;
        voter.donatedAmount = net; voter.remainingVotingPower = net;
        treasury.recordDonation(programId, msg.sender, net);
        donorNFT.mint(msg.sender, programId, nftMetadataURI);
        emit DonationReceived(programId, msg.sender, grossAmount, net);
        emit ProtocolFeeCollected(programId, msg.sender, fee);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 2 — APPLICATION & SCREENING
    // ═══════════════════════════════════════════════════════════════════

    function applyToProgram(
        uint256 programId,
        string calldata pCID, string calldata dCID, string calldata eCID, string calldata rCID,
        uint256 academicScore, uint256 incomeScore, uint256 recommendScore
    ) external nonReentrant programExists(programId) inStatus(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN) {
        _requireStudentEligible(msg.sender);
        ScholarshipTypes.Program storage prog = programs[programId];
        if (msg.sender == prog.initiator) revert CannotApplyToOwnProgram();
        if (retryCount[programId][msg.sender] >= _config.maxRetry) revert MaxRetriesExceeded();
        ScholarshipTypes.ApplicationStatus es = applicants[programId][msg.sender].status;
        if (es == ScholarshipTypes.ApplicationStatus.SHORTLISTED) revert AlreadyApplied();
        if (es == ScholarshipTypes.ApplicationStatus.LOCKED) revert MaxRetriesExceeded();

        uint8 retry = ++retryCount[programId][msg.sender];
        applicants[programId][msg.sender] = ScholarshipTypes.Applicant({
            programId: programId, wallet: msg.sender, status: ScholarshipTypes.ApplicationStatus.PENDING_REVIEW,
            profileCID: pCID, documentCID: dCID, essayCID: eCID, recommendCID: rCID,
            screeningScore: 0, totalScore: 0, voteScore: 0, scoreTimestamp: 0, retryCount: retry, scoreDisputed: false
        });

        if (retry == 1) { _programApplicants[programId].push(msg.sender); prog.applicantCount++; }
        if (prog.screeningMode == ScholarshipTypes.ScreeningMode.BY_STUDENT)
            _setScore(programId, msg.sender, academicScore, incomeScore, recommendScore, msg.sender);
        emit StudentApplied(programId, msg.sender, retry);
    }

    function submitCommitteeScore(uint256 programId, address applicant, uint256 a, uint256 i, uint256 r, address comm)
        external onlyRole(COMMITTEE_ROLE) programExists(programId)
    {
        if (programs[programId].screeningMode != ScholarshipTypes.ScreeningMode.BY_COMMITTEE)
            revert InvalidProgramStatus(ScholarshipTypes.ProgramStatus.SCREENING, programs[programId].status);
        _setScore(programId, applicant, a, i, r, comm);
    }

    function resolveShortlist(uint256 programId, address[] calldata ranked) external programExists(programId) onlyInitiator(programId) {
        _requireStatus(programId, ScholarshipTypes.ProgramStatus.SCREENING);
        ScholarshipTypes.Program storage prog = programs[programId];
        uint256 n = ranked.length;
        if (n != _programApplicants[programId].length) revert ApplicantListIncomplete();
        if (block.timestamp < prog.votingStart) revert TooEarly();

        for (uint256 i; i < n - 1; ) { if (applicants[programId][ranked[i]].screeningScore < applicants[programId][ranked[i+1]].screeningScore) revert InvalidSortOrder(); unchecked { ++i; } }

        uint256 ss = n < prog.maxCandidates ? n : prog.maxCandidates;
        for (uint256 i; i < ss; ) {
            address st = ranked[i]; ScholarshipTypes.Applicant storage app = applicants[programId][st];
            if (app.screeningScore >= ScholarshipTypes.SCREENING_THRESHOLD) {
                app.status = ScholarshipTypes.ApplicationStatus.SHORTLISTED;
                _shortlist[programId].push(st); prog.shortlistedCount++;
                emit StudentShortlisted(programId, st, app.screeningScore);
            } else _markScreenedOut(programId, st);
            unchecked { ++i; }
        }
        for (uint256 i = ss; i < n; ) { _markScreenedOut(programId, ranked[i]); unchecked { ++i; } }
        prog.status = ScholarshipTypes.ProgramStatus.VOTING;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.VOTING);
    }

    function _markScreenedOut(uint256 programId, address student) internal {
        ScholarshipTypes.Applicant storage app = applicants[programId][student];
        bool locked = app.retryCount >= _config.maxRetry;
        app.status = locked ? ScholarshipTypes.ApplicationStatus.LOCKED : ScholarshipTypes.ApplicationStatus.SCREENED_OUT;
        emit StudentScreenedOut(programId, student, app.screeningScore, locked);
    }

    function toggleOpenDonation(uint256 pid, bool open) external programExists(pid) onlyInitiator(pid) {
        programs[pid].openDonation = open;
        emit OpenDonationToggled(pid, open);
    }

    function selectWinners(
        uint256 pid,
        address[] calldata ranked,
        uint256[][] calldata amounts,
        string[][] calldata descs,
        bytes32[][] calldata providers,
        bytes32[][] calldata externalIds
    ) external nonReentrant programExists(pid) {
        _selectWinners(pid, ranked, amounts, descs, providers, externalIds);
    }

    function cancelProgram(uint256 pid) external nonReentrant programExists(pid) onlyInitiator(pid) {
        ScholarshipTypes.Program storage prog = programs[pid];
        if (prog.status == ScholarshipTypes.ProgramStatus.ACTIVE || prog.status == ScholarshipTypes.ProgramStatus.COMPLETED || prog.status == ScholarshipTypes.ProgramStatus.CANCELLED)
            revert InvalidProgramStatus(ScholarshipTypes.ProgramStatus.CREATED, prog.status);
        prog.status = ScholarshipTypes.ProgramStatus.CANCELLED;
        treasury.refundDonors(pid);
        emit ProgramCancelled(pid);
    }

    // ── Governance entry points ──────────────────────────────────────────────

    function setProtocolConfig(ScholarshipTypes.ProtocolConfig calldata c) external onlyRole(GOVERNANCE_ROLE) {
        _setProtocolConfig(c);
    }

    function adminForceStatus(uint256 pid, ScholarshipTypes.ProgramStatus s) external onlyRole(GOVERNANCE_ROLE) {
        _adminForceStatus(pid, s);
    }

    function adminUpdateDates(uint256 pid, uint256 aS, uint256 aE, uint256 vS, uint256 vE) external onlyRole(GOVERNANCE_ROLE) {
        _adminUpdateDates(pid, aS, aE, vS, vE);
    }

    function extendApplicationDeadline(uint256 pid, uint256 nE) external onlyRole(GOVERNANCE_ROLE) {
        _extendApplicationDeadline(pid, nE);
    }

    function extendVotingDeadline(uint256 pid, uint256 nE) external onlyRole(GOVERNANCE_ROLE) {
        _extendVotingDeadline(pid, nE);
    }
}
