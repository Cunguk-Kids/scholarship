// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ScholarshipTypes}     from "../libraries/ScholarshipTypes.sol";
import {IScholarshipTreasury} from "../interfaces/IScholarship.sol";
import {IScholarshipReputation} from "../interfaces/IScholarship.sol";
import {ScholarshipTreasury}  from "../finance/ScholarshipTreasury.sol";
import {ScholarshipReputation} from "../tokens/ScholarshipReputation.sol";
import {DonorNFT, StudentNFT} from "../tokens/ScholarshipNFTs.sol";

/**
 * @title  ScholarshipCore
 * @author Scholarship Protocol
 * @notice Central hub of the scholarship protocol.
 *
 * @dev    HANDLES (in lifecycle order)
 *         Phase 0 – Program creation and configuration
 *         Phase 1 – Donor contributions (USDC → voting power)
 *         Phase 2 – Student applications + two-path screening
 *                   PATH A (BY_COMMITTEE): committee members submit scores
 *                   PATH B (BY_STUDENT):   self-declare + 7-day dispute window
 *         Phase 3 – Token-weighted voting with confidence-stake option
 *         Phase 4 – Milestone execution: submit proof → dispute window → auto-release
 *         Phase 6 – Completion: scholar NFT + donor yield distribution
 *
 *         DELEGATES TO
 *         ScholarshipTreasury  – all USDC custody and movement
 *         ScholarshipBounty    – dispute lifecycle (via BOUNTY_ROLE callbacks)
 *         ScholarshipReputation – REP minting / burning / voting-power locks
 *         CommitteeGovernance  – score submission and dispute voting
 *
 * UPGRADEABILITY
 *   UUPS — only UPGRADER_ROLE may authorise an upgrade.
 *
 * ROLES
 *   DEFAULT_ADMIN_ROLE – governance / multisig
 *   UPGRADER_ROLE      – proxy admin
 *   BOUNTY_ROLE        – ScholarshipBounty (freeze/release/slash callbacks)
 *   COMMITTEE_ROLE     – CommitteeGovernance (score submission)
 */
contract ScholarshipCore is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    // ── Roles ────────────────────────────────────────────────────────────────

    bytes32 public constant UPGRADER_ROLE  = keccak256("UPGRADER_ROLE");
    bytes32 public constant BOUNTY_ROLE    = keccak256("BOUNTY_ROLE");
    bytes32 public constant COMMITTEE_ROLE = keccak256("COMMITTEE_ROLE");

    string  public constant VERSION        = "4.0.0";

    // ── External contracts ───────────────────────────────────────────────────

    IERC20               public usdc;
    ScholarshipTreasury  public treasury;
    ScholarshipReputation public reputation;
    DonorNFT             public donorNFT;
    StudentNFT           public studentNFT;

    // ── Storage ──────────────────────────────────────────────────────────────

    uint256 private _nextProgramId;
    uint256 private _nextMilestoneId;

    // programId → Program
    mapping(uint256 => ScholarshipTypes.Program)  public programs;
    // milestoneId → Milestone
    mapping(uint256 => ScholarshipTypes.Milestone) public milestones;

    // programId → applicant address → Applicant
    mapping(uint256 => mapping(address => ScholarshipTypes.Applicant)) public applicants;
    // programId → ordered list of all applicant addresses
    mapping(uint256 => address[]) private _programApplicants;
    // programId → shortlisted addresses
    mapping(uint256 => address[]) private _shortlist;

    // scholar wallet → programId → Scholar
    mapping(address => mapping(uint256 => ScholarshipTypes.Scholar)) public scholars;

    // Global student status (spans ALL programs)
    mapping(address => ScholarshipTypes.StudentStatus) public globalStudentStatus;
    mapping(address => uint256)                        public globalFreezeUntil;

    // Screening scores: programId → applicant → ScoreComponents
    mapping(uint256 => mapping(address => ScholarshipTypes.ScoreComponents)) public scoreComponents;

    // Voter info: programId → voter → VoterInfo
    // VoterInfo.votedFor tracks which scholar a voter backed (used for targeted REP rewards)
    mapping(uint256 => mapping(address => ScholarshipTypes.VoterInfo)) public voterInfo;

    // Retry tracking: programId → student → retry count
    mapping(uint256 => mapping(address => uint8)) public retryCount;

    // milestoneId → scholar address (for ownership checks)
    mapping(uint256 => address) public milestoneOwner;

    // BY_COMMITTEE programs → programId → assigned committee contract
    mapping(uint256 => address) public programCommittee;

    // ── Events ───────────────────────────────────────────────────────────────

    event ProgramCreated(uint256 indexed programId, address indexed initiator, string metadataCID);
    event ProgramStatusChanged(uint256 indexed programId, ScholarshipTypes.ProgramStatus newStatus);
    event CommitteeAssigned(uint256 indexed programId, address committeeContract);

    event DonationReceived(uint256 indexed programId, address indexed donor, uint256 grossAmount, uint256 netAmount);
    event StudentApplied(uint256 indexed programId, address indexed student, uint8 retryCount);
    event ScoreSubmitted(uint256 indexed programId, address indexed student, uint256 totalScore, address scoredBy);
    event StudentShortlisted(uint256 indexed programId, address indexed student, uint256 score);
    event StudentScreenedOut(uint256 indexed programId, address indexed student, uint256 score, bool locked);

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
    event ProgramCancelled(uint256 indexed programId);

    // ── Errors ───────────────────────────────────────────────────────────────

    error ProgramNotFound();
    error InvalidProgramStatus(ScholarshipTypes.ProgramStatus expected, ScholarshipTypes.ProgramStatus actual);
    error StudentFrozen(uint256 freezeUntil);
    error StudentBlacklisted();
    error AlreadyApplied();
    error MaxRetriesExceeded();
    error CannotApplyToOwnProgram();
    error InvalidScoreWeights();
    error InvalidCandidateRange();
    error InvalidSlashDistribution();
    error InvalidTimeline();
    error InvalidDisputeWindow();
    error InsufficientFund();
    error InsufficientDonation();
    error AlreadyDonated();
    error VotingPowerLocked();
    error InsufficientVotingPower();
    error MilestoneNotFound();
    error DisputeWindowStillOpen();
    error MilestoneNotInDisputeWindow();
    error NotMilestoneOwner();
    error ScholarNotActive();
    error QuorumNotMet();
    error CandidateNotShortlisted();
    error ConfidenceStakeAlreadyExists();
    error InvalidSortOrder();
    error TargetWinnersExceedsMax();
    error OnlyInitiator();
    error TooEarly();
    error VotingNotEnded();
    error ApplicantListIncomplete();
    error ConfidenceStakeExceedsDonation();
    error MustVoteBeforeStaking();
    error ConfidenceStakeMismatch();

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier programExists(uint256 programId) {
        if (programId == 0 || programId > _nextProgramId) revert ProgramNotFound();
        _;
    }

    modifier inStatus(uint256 programId, ScholarshipTypes.ProgramStatus expected) {
        if (programs[programId].status != expected)
            revert InvalidProgramStatus(expected, programs[programId].status);
        _;
    }

    modifier onlyInitiator(uint256 programId) {
        if (msg.sender != programs[programId].initiator) revert OnlyInitiator();
        _;
    }

    // ── Constructor / Initializer ────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /**
     * @notice Proxy initializer. Deploy then call this once via the proxy.
     *
     * @param admin        Multisig or DAO address — owns all roles initially.
     * @param _usdc        USDC contract address.
     * @param _treasury    Deployed ScholarshipTreasury proxy address.
     * @param _reputation  Deployed ScholarshipReputation proxy address.
     * @param _donorNFT    Deployed DonorNFT address.
     * @param _studentNFT  Deployed StudentNFT address.
     */
    function initialize(
        address admin,
        address _usdc,
        address _treasury,
        address _reputation,
        address _donorNFT,
        address _studentNFT
    ) external initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE,      admin);

        usdc       = IERC20(_usdc);
        treasury   = ScholarshipTreasury(_treasury);
        reputation = ScholarshipReputation(_reputation);
        donorNFT   = DonorNFT(_donorNFT);
        studentNFT = StudentNFT(_studentNFT);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 0 — PROGRAM CREATION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Create a new scholarship programme and lock the grant fund.
     *
     * @dev    Initiator must approve `totalFund` USDC to this contract
     *         before calling.  Fund is immediately forwarded to the treasury.
     *
     * @param metadataCID           IPFS CID of programme description + essay questions.
     * @param educationLevel        Target education level.
     * @param screeningMode         BY_COMMITTEE or BY_STUDENT.
     * @param weights               Score component weights (must sum to 100).
     * @param slashDist             Slash distribution (must sum to 100).
     * @param maxCandidates         Shortlist size (5–20).
     * @param targetWinners         Number of scholars to select.
     * @param timeline              [appStart, appEnd, voteStart, voteEnd] unix timestamps.
     * @param milestoneDisputeWindow Seconds a milestone stays in dispute window (7–14 days).
     * @param totalFund             USDC to lock (6-decimal).
     * @param committeeContract     For BY_COMMITTEE mode: address of CommitteeGovernance.
     *                              Pass address(0) for BY_STUDENT programmes.
     */
    function createProgram(
        string calldata metadataCID,
        ScholarshipTypes.EducationLevel educationLevel,
        ScholarshipTypes.ScreeningMode  screeningMode,
        ScholarshipTypes.ScoreWeights   calldata weights,
        ScholarshipTypes.SlashDistribution calldata slashDist,
        uint8   maxCandidates,
        uint8   targetWinners,
        uint256[4] calldata timeline,
        uint256 milestoneDisputeWindow,
        uint256 totalFund,
        address committeeContract
    ) external nonReentrant {
        // ── Validation ───────────────────────────────────────────────

        // Weights must sum to 100
        uint256 wSum = uint256(weights.academicWeight)
            + weights.incomeWeight
            + weights.essayWeight
            + weights.recommendWeight
            + weights.extracurricWeight;
        if (wSum != 100) revert InvalidScoreWeights();

        // Slash distribution must sum to 100
        uint256 sSum = uint256(slashDist.bountyHunterPercent)
            + slashDist.treasuryPercent
            + slashDist.protocolPercent;
        if (sSum != 100) revert InvalidSlashDistribution();

        // Candidate range
        if (maxCandidates < ScholarshipTypes.MIN_CANDIDATES ||
            maxCandidates > ScholarshipTypes.MAX_CANDIDATES)
            revert InvalidCandidateRange();

        if (targetWinners == 0 || targetWinners > maxCandidates)
            revert TargetWinnersExceedsMax();

        // Timeline must be coherent
        if (timeline[0] >= timeline[1] || timeline[2] >= timeline[3] ||
            timeline[1] >= timeline[2])
            revert InvalidTimeline();

        // Clamp dispute window to [7, 14] days
        uint256 disputeWindow = milestoneDisputeWindow;
        if (disputeWindow < 7 days || disputeWindow > 14 days)
            disputeWindow = 7 days;

        if (totalFund == 0) revert InsufficientFund();

        // ── Pull fund ───────────────────────────────────────────────
        usdc.safeTransferFrom(msg.sender, address(treasury), totalFund);

        uint256 programId = ++_nextProgramId;
        treasury.depositProgramFund(programId, totalFund);

        // ── Write program ───────────────────────────────────────────
        programs[programId] = ScholarshipTypes.Program({
            id:                     programId,
            initiator:              msg.sender,
            metadataCID:            metadataCID,
            educationLevel:         educationLevel,
            screeningMode:          screeningMode,
            status:                 ScholarshipTypes.ProgramStatus.CREATED,
            scoreWeights:           weights,
            slashDist:              slashDist,
            maxCandidates:          maxCandidates,
            targetWinners:          targetWinners,
            applicationStart:       timeline[0],
            applicationEnd:         timeline[1],
            votingStart:            timeline[2],
            votingEnd:              timeline[3],
            milestoneDisputeWindow: disputeWindow,
            totalFund:              totalFund,
            allocatedFund:          0,
            spentFund:              0,
            yieldAccrued:           0,
            applicantCount:         0,
            shortlistedCount:       0,
            activeScholarCount:     0
        });

        if (committeeContract != address(0)) {
            programCommittee[programId] = committeeContract;
            emit CommitteeAssigned(programId, committeeContract);
        }

        emit ProgramCreated(programId, msg.sender, metadataCID);
    }

    // ── Status transitions ────────────────────────────────────────────────────

    /**
     * @notice Open applications. Transitions CREATED → APPLICATION_OPEN.
     */
    function openApplications(uint256 programId)
        external programExists(programId) onlyInitiator(programId)
    {
        _requireStatus(programId, ScholarshipTypes.ProgramStatus.CREATED);
        if (block.timestamp < programs[programId].applicationStart) revert TooEarly();
        programs[programId].status = ScholarshipTypes.ProgramStatus.APPLICATION_OPEN;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN);
    }

    /**
     * @notice Close applications and enter screening. APPLICATION_OPEN → SCREENING.
     */
    function openScreening(uint256 programId)
        external programExists(programId) onlyInitiator(programId)
    {
        _requireStatus(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN);
        if (block.timestamp < programs[programId].applicationEnd) revert TooEarly();
        programs[programId].status = ScholarshipTypes.ProgramStatus.SCREENING;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.SCREENING);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 1 — DONATIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Donor contributes USDC to a programme during APPLICATION_OPEN phase.
     *
     *         Voting power = net donated amount (gross minus protocol fee).
     *         One donation per address (anti-Sybil — prevents vote-splitting).
     *         DonorNFT minted immediately as proof of contribution.
     *
     * @param programId      Target programme.
     * @param grossAmount    USDC to send (must be ≥ MIN_DONATION).
     * @param nftMetadataURI IPFS URI for the DonorNFT metadata.
     */
    function donate(
        uint256 programId,
        uint256 grossAmount,
        string calldata nftMetadataURI
    ) external nonReentrant programExists(programId)
      inStatus(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN)
    {
        if (grossAmount < ScholarshipTypes.MIN_DONATION) revert InsufficientDonation();

        ScholarshipTypes.VoterInfo storage voter = voterInfo[programId][msg.sender];
        if (voter.donatedAmount > 0) revert AlreadyDonated();

        usdc.safeTransferFrom(msg.sender, address(treasury), grossAmount);

        uint256 netAmount = grossAmount - ScholarshipTypes.TRANSACTION_FEE;
        voter.donatedAmount        = netAmount;
        voter.remainingVotingPower = netAmount;

        treasury.recordDonation(programId, msg.sender, netAmount);
        donorNFT.mint(msg.sender, programId, nftMetadataURI);

        emit DonationReceived(programId, msg.sender, grossAmount, netAmount);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 2 — APPLICATION & SCREENING
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Student submits a scholarship application.
     *
     *         All heavy documents remain on IPFS; only CIDs stored on-chain.
     *         In BY_STUDENT mode, self-declared scores are set immediately and
     *         enter a 7-day optimistic challenge window.
     *
     * @param programId                  Target programme.
     * @param profileCID                 IPFS: identity, photo, bio.
     * @param documentCID                IPFS: transcripts, income proof.
     * @param essayCID                   IPFS: essay answers.
     * @param recommendCID               IPFS: recommendation letter.
     * @param selfDeclaredAcademicScore  0–100 (ignored in BY_COMMITTEE mode).
     * @param selfDeclaredIncomeScore    0–100 (ignored in BY_COMMITTEE mode).
     * @param selfDeclaredRecommendScore 0–100 (ignored in BY_COMMITTEE mode).
     */
    function applyToProgram(
        uint256 programId,
        string calldata profileCID,
        string calldata documentCID,
        string calldata essayCID,
        string calldata recommendCID,
        uint256 selfDeclaredAcademicScore,
        uint256 selfDeclaredIncomeScore,
        uint256 selfDeclaredRecommendScore
    ) external nonReentrant programExists(programId)
      inStatus(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN)
    {
        ScholarshipTypes.Program storage prog = programs[programId];

        // Eligibility checks
        _requireStudentEligible(msg.sender);
        if (msg.sender == prog.initiator)             revert CannotApplyToOwnProgram();
        if (retryCount[programId][msg.sender] >= ScholarshipTypes.MAX_RETRY)
            revert MaxRetriesExceeded();

        // Cannot re-apply once shortlisted
        ScholarshipTypes.ApplicationStatus existingStatus =
            applicants[programId][msg.sender].status;
        if (existingStatus == ScholarshipTypes.ApplicationStatus.SHORTLISTED)
            revert AlreadyApplied();
        if (existingStatus == ScholarshipTypes.ApplicationStatus.LOCKED)
            revert MaxRetriesExceeded();

        uint8 retry = ++retryCount[programId][msg.sender];

        applicants[programId][msg.sender] = ScholarshipTypes.Applicant({
            programId:      programId,
            wallet:         msg.sender,
            status:         ScholarshipTypes.ApplicationStatus.PENDING_REVIEW,
            profileCID:     profileCID,
            documentCID:    documentCID,
            essayCID:       essayCID,
            recommendCID:   recommendCID,
            screeningScore: 0,
            totalScore:     0,
            voteScore:      0,
            scoreTimestamp: 0,
            retryCount:     retry,
            scoreDisputed:  false
        });

        // Only push to list on first application
        if (retry == 1) {
            _programApplicants[programId].push(msg.sender);
            prog.applicantCount++;
        }

        // BY_STUDENT: optimistic self-report — dispute window handled off-chain
        if (prog.screeningMode == ScholarshipTypes.ScreeningMode.BY_STUDENT) {
            _setScore(
                programId,
                msg.sender,
                selfDeclaredAcademicScore,
                selfDeclaredIncomeScore,
                selfDeclaredRecommendScore,
                msg.sender
            );
        }

        emit StudentApplied(programId, msg.sender, retry);
    }

    // ── Committee Scoring ────────────────────────────────────────────────────

    /**
     * @notice Called by CommitteeGovernance after averaging multiple member scores.
     *         Only valid in BY_COMMITTEE mode.
     *
     * @param programId        Target programme.
     * @param applicant        Applicant wallet.
     * @param academicScore    Averaged academic score (0–100).
     * @param incomeScore      Averaged income score (0–100).
     * @param recommendScore   Averaged recommendation score (0–100).
     * @param committeeAddress CommitteeGovernance contract address for audit.
     */
    function submitCommitteeScore(
        uint256 programId,
        address applicant,
        uint256 academicScore,
        uint256 incomeScore,
        uint256 recommendScore,
        address committeeAddress
    ) external onlyRole(COMMITTEE_ROLE) programExists(programId) {
        ScholarshipTypes.Program storage prog = programs[programId];
        require(
            prog.screeningMode == ScholarshipTypes.ScreeningMode.BY_COMMITTEE,
            "ScholarshipCore: not committee mode"
        );
        _setScore(programId, applicant, academicScore, incomeScore, recommendScore, committeeAddress);
    }

    /**
     * @dev Internal score setter shared by BY_COMMITTEE and BY_STUDENT paths.
     *      Computes a normalised score out of 1000 using only the screening-
     *      applicable weights (essay is excluded — scored by voters).
     */
    function _setScore(
        uint256 programId,
        address applicant,
        uint256 academic,
        uint256 income,
        uint256 recommend,
        address scoredBy
    ) internal {
        ScholarshipTypes.ScoreWeights memory w = programs[programId].scoreWeights;

        // Clamp raw inputs to [0, 100]
        academic  = academic  > 100 ? 100 : academic;
        income    = income    > 100 ? 100 : income;
        recommend = recommend > 100 ? 100 : recommend;

        // Screening uses only 3 components (essay = voters, extracurric optional)
        uint256 screenWeightSum = uint256(w.academicWeight)
            + w.incomeWeight
            + w.recommendWeight;

        uint256 weightedRaw = (academic  * w.academicWeight)
                            + (income    * w.incomeWeight)
                            + (recommend * w.recommendWeight);

        // Normalise to SCORE_MAX (1000)
        uint256 normalised = screenWeightSum > 0
            ? (weightedRaw * ScholarshipTypes.SCORE_MAX) / (screenWeightSum * 100)
            : 0;

        scoreComponents[programId][applicant] = ScholarshipTypes.ScoreComponents({
            academicScore:   academic,
            incomeScore:     income,
            recommendScore:  recommend,
            isSubmitted:     true,
            scoredBy:        scoredBy
        });

        ScholarshipTypes.Applicant storage app = applicants[programId][applicant];
        app.screeningScore  = normalised;
        app.totalScore      = normalised; // fixed at screening — voteScore tracks voting separately
        app.scoreTimestamp  = block.timestamp;

        emit ScoreSubmitted(programId, applicant, normalised, scoredBy);
    }

    // ── Shortlist Resolution ─────────────────────────────────────────────────

    /**
     * @notice Compute and persist the shortlist after all scores are in.
     *
     *         The initiator provides a caller-sorted list (gas efficient —
     *         sorts happen off-chain).  The contract validates descending order
     *         and enforces the SCREENING_THRESHOLD floor.
     *
     *         Transitions programme to VOTING.
     *
     * @param programId         Programme to resolve.
     * @param rankedApplicants  All scored applicants, sorted by score (desc).
     */
    function resolveShortlist(
        uint256 programId,
        address[] calldata rankedApplicants
    ) external programExists(programId)
      onlyInitiator(programId)
    {
        _requireStatus(programId, ScholarshipTypes.ProgramStatus.SCREENING);
        ScholarshipTypes.Program storage prog = programs[programId];

        uint256 n = rankedApplicants.length;

        // All applicants who submitted must appear in the ranked list — prevents
        // initiator from silently excluding applicants without the contract knowing.
        if (n != _programApplicants[programId].length) revert ApplicantListIncomplete();

        // Cannot transition to VOTING before votingStart
        if (block.timestamp < prog.votingStart) revert TooEarly();

        // Validate descending sort order
        for (uint256 i = 0; i < n - 1; ) {
            if (applicants[programId][rankedApplicants[i]].screeningScore <
                applicants[programId][rankedApplicants[i + 1]].screeningScore)
                revert InvalidSortOrder();
            unchecked { ++i; }
        }

        uint256 shortlistSize = n < prog.maxCandidates ? n : prog.maxCandidates;

        // Top N that clear the threshold
        for (uint256 i = 0; i < shortlistSize; ) {
            address student = rankedApplicants[i];
            ScholarshipTypes.Applicant storage app = applicants[programId][student];

            if (app.screeningScore >= ScholarshipTypes.SCREENING_THRESHOLD) {
                app.status = ScholarshipTypes.ApplicationStatus.SHORTLISTED;
                _shortlist[programId].push(student);
                prog.shortlistedCount++;
                emit StudentShortlisted(programId, student, app.screeningScore);
            } else {
                _markScreenedOut(programId, student);
            }
            unchecked { ++i; }
        }

        // Remainder are screened out
        for (uint256 i = shortlistSize; i < n; ) {
            _markScreenedOut(programId, rankedApplicants[i]);
            unchecked { ++i; }
        }

        prog.status = ScholarshipTypes.ProgramStatus.VOTING;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.VOTING);
    }

    function _markScreenedOut(uint256 programId, address student) internal {
        ScholarshipTypes.Applicant storage app = applicants[programId][student];
        bool locked = app.retryCount >= ScholarshipTypes.MAX_RETRY;
        app.status  = locked
            ? ScholarshipTypes.ApplicationStatus.LOCKED
            : ScholarshipTypes.ApplicationStatus.SCREENED_OUT;
        emit StudentScreenedOut(programId, student, app.screeningScore, locked);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 3 — VOTING
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Cast a token-weighted vote for a shortlisted candidate.
     *
     *         Rules:
     *         • Voter spends ALL remaining voting power on ONE candidate.
     *         • Voting power = net donation amount.
     *         • Voters whose REP-based voting power is locked cannot vote.
     *         • Vote weight is ADDITIVE on top of the screening score —
     *           this rewards candidates who both score well AND resonate
     *           with the donor community.
     *
     *         What voters see: profileCID + essayCID + educationLevel.
     *         What is HIDDEN:  screening score (avoids anchoring bias).
     *
     * @param programId  Target programme (must be VOTING status).
     * @param candidate  Shortlisted applicant wallet.
     */
    function voteForCandidate(
        uint256 programId,
        address candidate
    ) external nonReentrant programExists(programId)
      inStatus(programId, ScholarshipTypes.ProgramStatus.VOTING)
    {
        // Reputation lock check
        if (reputation.isVotingPowerLocked(msg.sender)) revert VotingPowerLocked();

        ScholarshipTypes.VoterInfo storage voter = voterInfo[programId][msg.sender];
        if (voter.remainingVotingPower == 0) revert InsufficientVotingPower();

        // Only shortlisted candidates may receive votes
        if (applicants[programId][candidate].status !=
            ScholarshipTypes.ApplicationStatus.SHORTLISTED)
            revert CandidateNotShortlisted();

        uint256 weight = voter.remainingVotingPower;

        // CEI: zero power before mutation
        voter.remainingVotingPower = 0;
        voter.votedFor             = candidate;  // Track for targeted REP rewards

        // Vote weight accumulates in its own field — keeps screening and voting dimensions separate
        applicants[programId][candidate].voteScore += weight;

        emit VoteCast(programId, msg.sender, candidate, weight);
    }

    /**
     * @notice Optionally place a confidence stake on a candidate.
     *
     *         This is a PURELY OPTIONAL signal of strong conviction.
     *         The stake is separate from voting power — a voter may stake
     *         without having voted (though typically both happen together).
     *
     *         Outcomes:
     *         • Scholar SUCCEEDS → stake returned + 20% yield bonus.
     *         • Scholar defrauds  → 50% of stake is slashed.
     *
     *         One confidence stake per voter per programme.
     *
     * @param programId  Target programme.
     * @param scholar    Candidate wallet to back.
     * @param amount     USDC to lock (voter must approve treasury first).
     */
    function placeConfidenceStake(
        uint256 programId,
        address scholar,
        uint256 amount
    ) external nonReentrant programExists(programId)
      inStatus(programId, ScholarshipTypes.ProgramStatus.VOTING)
    {
        ScholarshipTypes.VoterInfo storage voter = voterInfo[programId][msg.sender];
        if (voter.confidenceStake > 0) revert ConfidenceStakeAlreadyExists();

        // Must have voted, and must stake on the same scholar they voted for
        if (voter.votedFor == address(0))   revert MustVoteBeforeStaking();
        if (voter.votedFor != scholar)      revert ConfidenceStakeMismatch();

        // Cap stake at own donation amount — prevents accounting overflow in Treasury
        if (amount > voter.donatedAmount)   revert ConfidenceStakeExceedsDonation();

        usdc.safeTransferFrom(msg.sender, address(treasury), amount);
        treasury.depositConfidenceStake(programId, msg.sender, scholar, amount);

        voter.confidenceStake    = amount;
        voter.confidenceStakeFor = scholar;

        emit ConfidenceStaked(programId, msg.sender, scholar, amount);
    }

    // ── Select Winners ───────────────────────────────────────────────────────

    /**
     * @notice After voting ends, select top-N scholars and create milestones.
     *
     *         Initiator provides caller-sorted ranked list (off-chain sort).
     *         Contract validates descending order against totalScore.
     *         Quorum check: total voting power cast must exceed 50% of
     *         totalDonated — ensures meaningful community participation.
     *
     *         Transitions programme to ACTIVE.
     *
     * @param programId         Programme to finalise.
     * @param rankedCandidates  Shortlisted candidates sorted by totalScore (desc).
     * @param milestoneAmounts  milestoneAmounts[i] = array of milestone USDC amounts
     *                          for the i-th winner.
     */
    function selectWinners(
        uint256 programId,
        address[] calldata rankedCandidates,
        uint256[][] calldata milestoneAmounts
    ) external programExists(programId) onlyInitiator(programId) {
        _requireStatus(programId, ScholarshipTypes.ProgramStatus.VOTING);
        ScholarshipTypes.Program storage prog = programs[programId];

        // Voting period must have ended before winners can be selected
        if (block.timestamp < prog.votingEnd) revert VotingNotEnded();

        // Quorum check
        uint256 totalDonated = treasury.programTotalDonated(programId);
        uint256 totalCast    = _computeTotalVotingCast(programId);
        if (totalCast * 100 < totalDonated * ScholarshipTypes.QUORUM_PERCENT)
            revert QuorumNotMet();

        uint256 winnerCount = rankedCandidates.length < prog.targetWinners
            ? rankedCandidates.length
            : prog.targetWinners;

        // Validate descending order by voteScore (voting determines winner, not screening)
        for (uint256 i = 0; i < winnerCount - 1; ) {
            if (applicants[programId][rankedCandidates[i]].voteScore <
                applicants[programId][rankedCandidates[i + 1]].voteScore)
                revert InvalidSortOrder();
            unchecked { ++i; }
        }

        for (uint256 i = 0; i < winnerCount; ) {
            _activateScholar(programId, rankedCandidates[i], milestoneAmounts[i]);
            unchecked { ++i; }
        }

        prog.status = ScholarshipTypes.ProgramStatus.ACTIVE;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.ACTIVE);
    }

    /**
     * @dev Compute total voting power actually cast in a programme.
     *      Iterates all donors and checks if they voted (remainingVotingPower == 0
     *      and votedFor != address(0)).
     */
    function _computeTotalVotingCast(uint256 programId) internal view returns (uint256 cast) {
        address[] memory donors = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < donors.length; ) {
            ScholarshipTypes.VoterInfo storage v = voterInfo[programId][donors[i]];
            if (v.votedFor != address(0)) {
                cast += v.donatedAmount;
            }
            unchecked { ++i; }
        }
    }

    function _activateScholar(
        uint256   programId,
        address   winner,
        uint256[] memory amounts
    ) internal {
        scholars[winner][programId] = ScholarshipTypes.Scholar({
            programId:        programId,
            wallet:           winner,
            status:           ScholarshipTypes.StudentStatus.ACTIVE,
            freezeUntil:      0,
            isBlacklisted:    false,
            currentMilestone: 0,
            totalMilestones:  amounts.length,
            totalReceived:    0
        });

        programs[programId].activeScholarCount++;
        programs[programId].allocatedFund += _sumArray(amounts);

        for (uint256 j = 0; j < amounts.length; ) {
            uint256 mId = ++_nextMilestoneId;
            milestones[mId] = ScholarshipTypes.Milestone({
                id:              mId,
                programId:       programId,
                scholar:         winner,
                amount:          amounts[j],
                descriptionCID:  "",
                proofCID:        "",
                status:          ScholarshipTypes.MilestoneStatus.PENDING,
                submittedAt:     0,
                disputeDeadline: 0,
                completedAt:     0,
                isFirstMilestone: j == 0
            });
            milestoneOwner[mId] = winner;
            unchecked { ++j; }
        }

        emit ScholarSelected(programId, winner);
    }

    function _sumArray(uint256[] memory arr) private pure returns (uint256 s) {
        for (uint256 i = 0; i < arr.length; ) {
            s += arr[i];
            unchecked { ++i; }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 4 — MILESTONE EXECUTION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Scholar submits proof for the next pending milestone.
     *         Starts the programme-configured dispute window countdown.
     *
     * @param milestoneId  The milestone to submit proof for.
     * @param proofCID     IPFS CID of proof documents / photos.
     */
    function submitMilestoneProof(
        uint256 milestoneId,
        string calldata proofCID
    ) external nonReentrant {
        ScholarshipTypes.Milestone storage m = milestones[milestoneId];
        if (m.scholar == address(0))            revert MilestoneNotFound();
        if (msg.sender != m.scholar)            revert NotMilestoneOwner();
        if (m.status != ScholarshipTypes.MilestoneStatus.PENDING)
            revert MilestoneNotInDisputeWindow();

        ScholarshipTypes.Scholar storage scholar = scholars[msg.sender][m.programId];
        if (scholar.status != ScholarshipTypes.StudentStatus.ACTIVE)
            revert ScholarNotActive();

        m.proofCID       = proofCID;
        m.status         = ScholarshipTypes.MilestoneStatus.SUBMITTED;
        m.submittedAt    = block.timestamp;
        m.disputeDeadline = block.timestamp + programs[m.programId].milestoneDisputeWindow;

        emit MilestoneSubmitted(milestoneId, msg.sender, proofCID);
    }

    /**
     * @notice Release a milestone payment after the dispute window expires.
     *
     *         Permissionless — anyone may call.  This prevents milestones
     *         from hanging indefinitely and provides a liveness guarantee.
     *
     * @param milestoneId  The milestone to execute.
     */
    function executeMilestone(uint256 milestoneId) external nonReentrant {
        ScholarshipTypes.Milestone storage m = milestones[milestoneId];
        if (m.status != ScholarshipTypes.MilestoneStatus.SUBMITTED)
            revert MilestoneNotInDisputeWindow();
        if (block.timestamp < m.disputeDeadline)
            revert DisputeWindowStillOpen();

        _completeMilestone(milestoneId);
    }

    function _completeMilestone(uint256 milestoneId) internal {
        ScholarshipTypes.Milestone storage m = milestones[milestoneId];
        m.status      = ScholarshipTypes.MilestoneStatus.COMPLETED;
        m.completedAt = block.timestamp;

        ScholarshipTypes.Scholar storage scholar = scholars[m.scholar][m.programId];
        scholar.currentMilestone++;
        scholar.totalReceived += m.amount;

        programs[m.programId].spentFund += m.amount;

        treasury.disburseMilestone(m.scholar, m.programId, milestoneId, m.amount);

        // +10 REP to voters who backed this scholar
        _rewardVotersOf(m.programId, m.scholar, 10, "milestone_completed");

        emit MilestoneCompleted(milestoneId, m.scholar, m.amount);

        if (scholar.currentMilestone == scholar.totalMilestones) {
            _completeScholar(m.programId, m.scholar);
        }
    }

    function _completeScholar(uint256 programId, address scholarAddr) internal {
        scholars[scholarAddr][programId].status = ScholarshipTypes.StudentStatus.COMPLETED;
        globalStudentStatus[scholarAddr] = ScholarshipTypes.StudentStatus.COMPLETED;

        // +50 REP bonus to all backers
        _rewardVotersOf(programId, scholarAddr, 50, "scholar_completed");

        // Resolve confidence stakes positively for this scholar's backers
        _resolveConfidenceStakesFor(programId, scholarAddr, true);

        // Mint scholar credential NFT
        studentNFT.mint(scholarAddr, programId, "");

        emit ScholarCompleted(programId, scholarAddr);

        // If all active scholars are done, complete the programme
        ScholarshipTypes.Program storage prog = programs[programId];
        if (scholar_allCompleted(programId)) {
            prog.status = ScholarshipTypes.ProgramStatus.COMPLETED;
            treasury.distributeYield(programId);
            emit ProgramCompleted(programId);
        }
    }

    /**
     * @dev Check whether all active scholars in a programme have completed.
     *      Iterates shortlist — only scholars in SHORTLISTED → ACTIVE → COMPLETED path.
     */
    function scholar_allCompleted(uint256 programId) internal view returns (bool) {
        address[] memory sl = _shortlist[programId];
        for (uint256 i = 0; i < sl.length; ) {
            ScholarshipTypes.Scholar storage s = scholars[sl[i]][programId];
            // Only check those who became active scholars
            if (s.totalMilestones > 0 &&
                s.status != ScholarshipTypes.StudentStatus.COMPLETED &&
                s.status != ScholarshipTypes.StudentStatus.FROZEN &&
                s.status != ScholarshipTypes.StudentStatus.BLACKLISTED)
            {
                return false;
            }
            unchecked { ++i; }
        }
        return true;
    }

    // ── Freeze / Release (BOUNTY_ROLE callbacks) ──────────────────────────────

    /**
     * @notice Freeze a milestone when a bounty hunter raises a dispute.
     *         Called by ScholarshipBounty; gated by BOUNTY_ROLE.
     */
    function freezeMilestone(uint256 milestoneId)
        external onlyRole(BOUNTY_ROLE)
    {
        milestones[milestoneId].status = ScholarshipTypes.MilestoneStatus.FROZEN;
        emit MilestoneFrozen(milestoneId);
    }

    /**
     * @notice Unfreeze a milestone when a bounty hunter loses a dispute.
     *         Restarts the dispute window from now.
     *         Called by ScholarshipBounty; gated by BOUNTY_ROLE.
     */
    function releaseMilestone(uint256 milestoneId)
        external onlyRole(BOUNTY_ROLE)
    {
        ScholarshipTypes.Milestone storage m = milestones[milestoneId];
        m.status         = ScholarshipTypes.MilestoneStatus.SUBMITTED;
        // Restart dispute window so BH cannot immediately re-raise
        m.disputeDeadline = block.timestamp + programs[m.programId].milestoneDisputeWindow;
        emit MilestoneReleased(milestoneId);
    }

    // ── Slash (BOUNTY_ROLE callback) ─────────────────────────────────────────

    /**
     * @notice Apply fraud penalty to a scholar after a bounty hunter wins.
     *
     *         LIGHT_FRAUD    → 6-month global freeze
     *         MILESTONE_FRAUD → 1-year global freeze
     *         HEAVY_FRAUD    → 2-year freeze + permanent BLACKLISTED
     *
     *         Additionally: punishes ONLY voters who voted for this scholar
     *         (not all donors) via REP burn + voting power lock.
     *
     * @param wallet      Scholar wallet.
     * @param programId   Programme in which the fraud occurred.
     * @param disputeType Fraud severity classification.
     */
    function slashScholar(
        address wallet,
        uint256 programId,
        ScholarshipTypes.DisputeType disputeType
    ) external onlyRole(BOUNTY_ROLE) {
        ScholarshipTypes.Scholar storage scholar = scholars[wallet][programId];
        scholar.status = ScholarshipTypes.StudentStatus.FROZEN;

        uint256 freezeDuration;
        bool    blacklist = false;

        if (disputeType == ScholarshipTypes.DisputeType.LIGHT_FRAUD) {
            freezeDuration = ScholarshipTypes.FREEZE_LIGHT;
        } else if (disputeType == ScholarshipTypes.DisputeType.MILESTONE_FRAUD) {
            freezeDuration = ScholarshipTypes.FREEZE_MILESTONE;
        } else {
            freezeDuration = ScholarshipTypes.FREEZE_HEAVY;
            blacklist      = true;
        }

        globalFreezeUntil[wallet]   = block.timestamp + freezeDuration;
        globalStudentStatus[wallet] = blacklist
            ? ScholarshipTypes.StudentStatus.BLACKLISTED
            : ScholarshipTypes.StudentStatus.FROZEN;

        if (blacklist) scholar.isBlacklisted = true;

        // REP penalty scales with fraud severity
        uint256 repPenalty = disputeType == ScholarshipTypes.DisputeType.LIGHT_FRAUD  ? 50
                           : disputeType == ScholarshipTypes.DisputeType.MILESTONE_FRAUD ? 100
                           : 200;

        // Only penalise voters who actually backed this scholar
        _punishVotersOf(programId, wallet, repPenalty, block.timestamp + freezeDuration);

        // Slash confidence stakes of voters who staked on this scholar
        _resolveConfidenceStakesFor(programId, wallet, false);

        emit ScholarSlashed(wallet, programId, disputeType);
    }

    // ── Programme Cancellation ───────────────────────────────────────────────

    /**
     * @notice Initiator cancels a programme before it reaches ACTIVE status.
     *         All donors are refunded pro-rata from remaining balance.
     */
    function cancelProgram(uint256 programId)
        external nonReentrant programExists(programId) onlyInitiator(programId)
    {
        ScholarshipTypes.Program storage prog = programs[programId];
        require(
            prog.status != ScholarshipTypes.ProgramStatus.COMPLETED &&
            prog.status != ScholarshipTypes.ProgramStatus.CANCELLED,
            "ScholarshipCore: cannot cancel"
        );

        prog.status = ScholarshipTypes.ProgramStatus.CANCELLED;
        treasury.refundDonors(programId);
        emit ProgramCancelled(programId);
    }

    // ═══════════════════════════════════════════════════════════════════
    // INTERNAL — VOTER REP HELPERS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @dev Award REP only to donors whose `votedFor` matches `scholarAddr`.
     *      This prevents rewarding donors who did not vote for this scholar.
     */
    function _rewardVotersOf(
        uint256 programId,
        address scholarAddr,
        uint256 repAmount,
        string memory reason
    ) internal {
        address[] memory donors = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < donors.length; ) {
            if (voterInfo[programId][donors[i]].votedFor == scholarAddr) {
                reputation.mint(donors[i], repAmount, reason);
            }
            unchecked { ++i; }
        }
    }

    /**
     * @dev Burn REP and lock voting power for donors who voted for a fraudulent scholar.
     */
    function _punishVotersOf(
        uint256 programId,
        address scholarAddr,
        uint256 repPenalty,
        uint256 lockUntil
    ) internal {
        address[] memory donors = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < donors.length; ) {
            if (voterInfo[programId][donors[i]].votedFor == scholarAddr) {
                reputation.burn(donors[i], repPenalty, "scholar_slashed");
                reputation.lockVotingPower(donors[i], lockUntil);
            }
            unchecked { ++i; }
        }
    }

    /**
     * @dev Resolve confidence stakes for all voters who staked on `scholarAddr`.
     *      `succeeded = true` → bonus; `false` → slash.
     */
    function _resolveConfidenceStakesFor(
        uint256 programId,
        address scholarAddr,
        bool    succeeded
    ) internal {
        address[] memory donors = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < donors.length; ) {
            ScholarshipTypes.VoterInfo storage vi = voterInfo[programId][donors[i]];
            if (vi.confidenceStakeFor == scholarAddr && vi.confidenceStake > 0) {
                treasury.resolveConfidenceStake(programId, donors[i], succeeded);
            }
            unchecked { ++i; }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // INTERNAL UTILITIES
    // ═══════════════════════════════════════════════════════════════════

    function _requireStudentEligible(address wallet) internal view {
        ScholarshipTypes.StudentStatus status = globalStudentStatus[wallet];
        if (status == ScholarshipTypes.StudentStatus.BLACKLISTED)
            revert StudentBlacklisted();
        if (status == ScholarshipTypes.StudentStatus.FROZEN &&
            block.timestamp < globalFreezeUntil[wallet])
            revert StudentFrozen(globalFreezeUntil[wallet]);
    }

    function _requireStatus(
        uint256 programId,
        ScholarshipTypes.ProgramStatus expected
    ) internal view {
        if (programs[programId].status != expected)
            revert InvalidProgramStatus(expected, programs[programId].status);
    }

    // ═══════════════════════════════════════════════════════════════════
    // VIEWS
    // ═══════════════════════════════════════════════════════════════════

    function getProgram(uint256 programId)
        external view returns (ScholarshipTypes.Program memory)
    {
        return programs[programId];
    }

    function getScholar(address wallet, uint256 programId)
        external view returns (ScholarshipTypes.Scholar memory)
    {
        return scholars[wallet][programId];
    }

    function getMilestone(uint256 milestoneId)
        external view returns (ScholarshipTypes.Milestone memory)
    {
        return milestones[milestoneId];
    }

    function getShortlist(uint256 programId)
        external view returns (address[] memory)
    {
        return _shortlist[programId];
    }

    function getProgramApplicants(uint256 programId)
        external view returns (address[] memory)
    {
        return _programApplicants[programId];
    }

    function isStudentEligible(address wallet)
        external view returns (bool eligible, string memory reason)
    {
        ScholarshipTypes.StudentStatus status = globalStudentStatus[wallet];
        if (status == ScholarshipTypes.StudentStatus.BLACKLISTED)
            return (false, "Permanently blacklisted");
        if (status == ScholarshipTypes.StudentStatus.FROZEN &&
            block.timestamp < globalFreezeUntil[wallet])
            return (false, "Temporarily frozen");
        return (true, "");
    }

    /**
     * @notice Returns USDC value of undisbursed milestones for a scholar.
     *         Used by ScholarshipBounty to calculate stake and reward amounts.
     */
    function getRemainingFund(address /* wallet */, uint256 programId)
        external view returns (uint256)
    {
        return treasury.getProgramBalance(programId);
    }

    // ── UUPS ─────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}
}
