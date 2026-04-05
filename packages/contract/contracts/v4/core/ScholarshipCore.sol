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
 * @notice Entry-point contract.  Inherits voting, scholar activation, and
 *         milestone callbacks from ScholarshipCoreBase.
 *
 * @dev    KEY CHANGE vs v4:
 *         createProgram() accepts `maxOptionalMilestones` (uint8, 0–5).
 *         0 = program creator disables optional milestone proposals entirely.
 *         This is stored on Program and read by MilestoneManager.proposeMilestone().
 *
 *         CommitteeGovernance is set per-program on both Core (for scoring)
 *         and MilestoneManager (for approval/rejection), in a single tx.
 */
contract ScholarshipCore is ScholarshipCoreBase {
    using SafeERC20 for IERC20;

    // ── Events ───────────────────────────────────────────────────────────────
    event ProgramCreated(uint256 indexed programId, address indexed initiator, string metadataCID);
    event CommitteeAssigned(uint256 indexed programId, address committeeContract);
    event DonationReceived(uint256 indexed programId, address indexed donor, uint256 grossAmount, uint256 netAmount);
    event StudentApplied(uint256 indexed programId, address indexed student, uint8 retryCount);
    event ScoreSubmitted(uint256 indexed programId, address indexed student, uint256 totalScore, address scoredBy);
    event StudentShortlisted(uint256 indexed programId, address indexed student, uint256 score);
    event StudentScreenedOut(uint256 indexed programId, address indexed student, uint256 score, bool locked);
    event ProgramCancelled(uint256 indexed programId);


    // ── Errors ───────────────────────────────────────────────────────────────
    error InvalidScoreWeights();
    error InvalidSlashDistribution();
    error InvalidCandidateRange();
    error TargetWinnersExceedsMax();
    error InvalidTimeline();
    error InsufficientFund();
    error InsufficientDonation();
    error AlreadyDonated();
    error CannotApplyToOwnProgram();
    error MaxRetriesExceeded();
    error AlreadyApplied();
    error ApplicantListIncomplete();
    error TooEarly();
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
        address _milestoneManager
    ) external initializer {
        _initReentrancy();
        admin            = _admin;
        _roles[UPGRADER_ROLE][_admin] = true;
        usdc             = IERC20(_usdc);
        treasury         = IScholarshipTreasury(_treasury);
        reputation       = IScholarshipReputation(_reputation);
        donorNFT         = ICredentialNFT(_donorNFT);
        studentNFT       = ICredentialNFT(_studentNFT);
        milestoneManager = IMilestoneManager(_milestoneManager);
        // Grant MilestoneManager the MILESTONE_ROLE so it can call onOptionalApproved/onMilestoneCompleted
        _roles[MILESTONE_ROLE][_milestoneManager] = true;
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 0 — PROGRAM CREATION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @param maxOptionalMilestones  Max optional milestones a scholar may propose.
     *                               0 = optional milestones disabled for this program.
     *                               Max capped at MAX_OPTIONAL_MILESTONES (5).
     * @param committeeContract      Address of CommitteeGovernance for this program.
     *                               Must be non-zero if screeningMode = BY_COMMITTEE
     *                               or if maxOptionalMilestones > 0.
     */
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
        uint8   maxOptionalMilestones,   // v5: 0–5
        address committeeContract
    ) external nonReentrant {
        // Validations
        { uint256 wSum = uint256(weights.academicWeight) + weights.incomeWeight + weights.essayWeight + weights.recommendWeight + weights.extracurricWeight; if (wSum != 100) revert InvalidScoreWeights(); }
        { uint256 sSum = uint256(slashDist.bountyHunterPercent) + slashDist.treasuryPercent + slashDist.protocolPercent; if (sSum != 100) revert InvalidSlashDistribution(); }
        if (maxCandidates < ScholarshipTypes.MIN_CANDIDATES || maxCandidates > ScholarshipTypes.MAX_CANDIDATES) revert InvalidCandidateRange();
        if (targetWinners == 0 || targetWinners > maxCandidates) revert TargetWinnersExceedsMax();
        if (timeline[0] >= timeline[1] || timeline[2] >= timeline[3] || timeline[1] >= timeline[2]) revert InvalidTimeline();
        if (totalFund == 0) revert InsufficientFund();
        if (maxOptionalMilestones > ScholarshipTypes.MAX_OPTIONAL_MILESTONES) revert InvalidMaxOptional();

        uint256 dw  = (milestoneDisputeWindow < 7 days || milestoneDisputeWindow > 14 days) ? 7 days : milestoneDisputeWindow;
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
            maxOptionalMilestones: maxOptionalMilestones
        });

        if (committeeContract != address(0)) {
            programCommittee[pid] = committeeContract;
            // Also register committee in MilestoneManager in same tx
            milestoneManager.setProgramCommittee(pid, committeeContract);
            emit CommitteeAssigned(pid, committeeContract);
        }

        emit ProgramCreated(pid, msg.sender, metadataCID);
    }

    // ── Status transitions (unchanged) ───────────────────────────────────────

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
    // PHASE 1 — DONATIONS (unchanged)
    // ═══════════════════════════════════════════════════════════════════

    function donate(uint256 programId, uint256 grossAmount, string calldata nftMetadataURI)
        external nonReentrant programExists(programId) inStatus(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN)
    {
        if (grossAmount < ScholarshipTypes.MIN_DONATION) revert InsufficientDonation();
        ScholarshipTypes.VoterInfo storage voter = voterInfo[programId][msg.sender];
        if (voter.donatedAmount > 0) revert AlreadyDonated();
        usdc.safeTransferFrom(msg.sender, address(treasury), grossAmount);
        uint256 net = grossAmount - ScholarshipTypes.TRANSACTION_FEE;
        voter.donatedAmount = net; voter.remainingVotingPower = net;
        treasury.recordDonation(programId, msg.sender, net);
        donorNFT.mint(msg.sender, programId, nftMetadataURI);
        emit DonationReceived(programId, msg.sender, grossAmount, net);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 2 — APPLICATION & SCREENING (unchanged)
    // ═══════════════════════════════════════════════════════════════════

    function applyToProgram(
        uint256 programId,
        string calldata profileCID, string calldata documentCID, string calldata essayCID, string calldata recommendCID,
        uint256 academicScore, uint256 incomeScore, uint256 recommendScore
    ) external nonReentrant programExists(programId) inStatus(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN) {
        ScholarshipTypes.Program storage prog = programs[programId];
        _requireStudentEligible(msg.sender);
        if (msg.sender == prog.initiator) revert CannotApplyToOwnProgram();
        if (retryCount[programId][msg.sender] >= ScholarshipTypes.MAX_RETRY) revert MaxRetriesExceeded();
        ScholarshipTypes.ApplicationStatus es = applicants[programId][msg.sender].status;
        if (es == ScholarshipTypes.ApplicationStatus.SHORTLISTED) revert AlreadyApplied();
        if (es == ScholarshipTypes.ApplicationStatus.LOCKED) revert MaxRetriesExceeded();

        uint8 retry = ++retryCount[programId][msg.sender];
        applicants[programId][msg.sender] = ScholarshipTypes.Applicant({
            programId: programId, wallet: msg.sender, status: ScholarshipTypes.ApplicationStatus.PENDING_REVIEW,
            profileCID: profileCID, documentCID: documentCID, essayCID: essayCID, recommendCID: recommendCID,
            screeningScore: 0, totalScore: 0, voteScore: 0, scoreTimestamp: 0, retryCount: retry, scoreDisputed: false
        });

        if (retry == 1) { _programApplicants[programId].push(msg.sender); prog.applicantCount++; }
        if (prog.screeningMode == ScholarshipTypes.ScreeningMode.BY_STUDENT)
            _setScore(programId, msg.sender, academicScore, incomeScore, recommendScore, msg.sender);
        emit StudentApplied(programId, msg.sender, retry);
    }

    function submitCommitteeScore(uint256 programId, address applicant, uint256 academicScore, uint256 incomeScore, uint256 recommendScore, address committeeAddress)
        external onlyRole(COMMITTEE_ROLE) programExists(programId)
    {
        if (programs[programId].screeningMode != ScholarshipTypes.ScreeningMode.BY_COMMITTEE)
            revert InvalidProgramStatus(ScholarshipTypes.ProgramStatus.SCREENING, programs[programId].status);
        _setScore(programId, applicant, academicScore, incomeScore, recommendScore, committeeAddress);
    }

    function _setScore(uint256 programId, address applicant, uint256 academic, uint256 income, uint256 recommend, address scoredBy) internal {
        ScholarshipTypes.ScoreWeights memory w = programs[programId].scoreWeights;
        academic = academic > 100 ? 100 : academic; income = income > 100 ? 100 : income; recommend = recommend > 100 ? 100 : recommend;
        uint256 sw = uint256(w.academicWeight) + w.incomeWeight + w.recommendWeight;
        uint256 norm = sw > 0 ? ((academic * w.academicWeight + income * w.incomeWeight + recommend * w.recommendWeight) * ScholarshipTypes.SCORE_MAX) / (sw * 100) : 0;
        scoreComponents[programId][applicant] = ScholarshipTypes.ScoreComponents({ academicScore: academic, incomeScore: income, recommendScore: recommend, isSubmitted: true, scoredBy: scoredBy });
        applicants[programId][applicant].screeningScore = norm;
        applicants[programId][applicant].totalScore = norm;
        applicants[programId][applicant].scoreTimestamp = block.timestamp;
        emit ScoreSubmitted(programId, applicant, norm, scoredBy);
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
        bool locked = app.retryCount >= ScholarshipTypes.MAX_RETRY;
        app.status = locked ? ScholarshipTypes.ApplicationStatus.LOCKED : ScholarshipTypes.ApplicationStatus.SCREENED_OUT;
        emit StudentScreenedOut(programId, student, app.screeningScore, locked);
    }

    function cancelProgram(uint256 programId) external nonReentrant programExists(programId) onlyInitiator(programId) {
        ScholarshipTypes.Program storage prog = programs[programId];
        if (prog.status == ScholarshipTypes.ProgramStatus.ACTIVE
         || prog.status == ScholarshipTypes.ProgramStatus.COMPLETED
         || prog.status == ScholarshipTypes.ProgramStatus.CANCELLED)
            revert InvalidProgramStatus(ScholarshipTypes.ProgramStatus.CREATED, prog.status);
        prog.status = ScholarshipTypes.ProgramStatus.CANCELLED;
        treasury.refundDonors(programId);
        emit ProgramCancelled(programId);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // DATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// Extension counters per program (not on Program struct — avoids layout change)
    mapping(uint256 => uint8) public applicationExtensionCount;
    mapping(uint256 => uint8) public votingExtensionCount;

    uint8   public constant MAX_EXTENSIONS       = 2;
    uint256 public constant MAX_EXTENSION_DURATION = 30 days;

    // Events
    event ApplicationDeadlineExtended(uint256 indexed programId, uint256 oldEnd, uint256 newEnd, uint8 extensionCount);
    event VotingDeadlineExtended(uint256 indexed programId, uint256 oldEnd, uint256 newEnd, uint8 extensionCount);
    event AdminBypassStatusForced(uint256 indexed programId, ScholarshipTypes.ProgramStatus newStatus, address admin);
    event AdminBypassDatesUpdated(uint256 indexed programId, uint256 appStart, uint256 appEnd, uint256 voteStart, uint256 voteEnd, address admin);

    // Errors
    error CannotShortenDeadline();
    error NewEndMustBeBeforeVotingStart();
    error NewVotingEndMustBeAfterVotingStart();
    error MaxExtensionsReached();
    error ExtensionTooLong();

    /**
     * @notice Extend the application deadline. Initiator only.
     *         - Only during APPLICATION_OPEN status
     *         - Can only extend (not shorten)
     *         - newEnd must be < votingStart
     *         - Max 30 days per extension, max 2 extensions total
     */
    function extendApplicationDeadline(
        uint256 programId,
        uint256 newEnd
    ) external programExists(programId) onlyInitiator(programId)
      inStatus(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN)
    {
        if (applicationExtensionCount[programId] >= MAX_EXTENSIONS)
            revert MaxExtensionsReached();

        ScholarshipTypes.Program storage prog = programs[programId];
        uint256 oldEnd = prog.applicationEnd;

        if (newEnd <= oldEnd)               revert CannotShortenDeadline();
        if (newEnd >= prog.votingStart)     revert NewEndMustBeBeforeVotingStart();
        if (newEnd - oldEnd > MAX_EXTENSION_DURATION) revert ExtensionTooLong();

        prog.applicationEnd = newEnd;
        uint8 count = ++applicationExtensionCount[programId];
        emit ApplicationDeadlineExtended(programId, oldEnd, newEnd, count);
    }

    /**
     * @notice Extend the voting deadline. Initiator only.
     *         - Only during VOTING status
     *         - Can only extend (not shorten)
     *         - Max 30 days per extension, max 2 extensions total
     */
    function extendVotingDeadline(
        uint256 programId,
        uint256 newEnd
    ) external programExists(programId) onlyInitiator(programId)
      inStatus(programId, ScholarshipTypes.ProgramStatus.VOTING)
    {
        if (votingExtensionCount[programId] >= MAX_EXTENSIONS)
            revert MaxExtensionsReached();

        ScholarshipTypes.Program storage prog = programs[programId];
        uint256 oldEnd = prog.votingEnd;

        if (newEnd <= oldEnd)               revert CannotShortenDeadline();
        if (newEnd <= prog.votingStart)     revert NewVotingEndMustBeAfterVotingStart();
        if (newEnd - oldEnd > MAX_EXTENSION_DURATION) revert ExtensionTooLong();

        prog.votingEnd = newEnd;
        uint8 count = ++votingExtensionCount[programId];
        emit VotingDeadlineExtended(programId, oldEnd, newEnd, count);
    }

    /**
     * @notice ADMIN ONLY — force program to any status, skipping all checks.
     *         Cannot force CANCELLED (use cancelProgram) or COMPLETED
     *         (side-effects must run normally).
     *         Always emits event for on-chain auditability.
     */
    function adminForceStatus(
        uint256 programId,
        ScholarshipTypes.ProgramStatus newStatus
    ) external programExists(programId) {
        if (msg.sender != admin) revert NotAdmin();
        require(
            newStatus != ScholarshipTypes.ProgramStatus.CANCELLED &&
            newStatus != ScholarshipTypes.ProgramStatus.COMPLETED,
            "ScholarshipCore: use cancelProgram or normal completion flow"
        );
        programs[programId].status = newStatus;
        emit AdminBypassStatusForced(programId, newStatus, msg.sender);
        emit ProgramStatusChanged(programId, newStatus);
    }

    /**
     * @notice ADMIN ONLY — overwrite all four timeline dates at once.
     *         Bypasses TooEarly, CannotShortenDeadline, MaxExtensionsReached.
     *         Resets extension counters so normal flow works cleanly after.
     *         Basic coherence (appStart < appEnd < voteStart < voteEnd) enforced.
     */
    function adminUpdateDates(
        uint256 programId,
        uint256 appStart,
        uint256 appEnd,
        uint256 voteStart,
        uint256 voteEnd
    ) external programExists(programId) {
        if (msg.sender != admin) revert NotAdmin();
        if (appStart >= appEnd || appEnd >= voteStart || voteStart >= voteEnd)
            revert InvalidTimeline();

        ScholarshipTypes.Program storage prog = programs[programId];
        prog.applicationStart = appStart;
        prog.applicationEnd   = appEnd;
        prog.votingStart      = voteStart;
        prog.votingEnd        = voteEnd;

        applicationExtensionCount[programId] = 0;
        votingExtensionCount[programId]      = 0;

        emit AdminBypassDatesUpdated(programId, appStart, appEnd, voteStart, voteEnd, msg.sender);
    }

}

