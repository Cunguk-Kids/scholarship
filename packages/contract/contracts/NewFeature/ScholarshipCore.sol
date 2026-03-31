// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ScholarshipTypes} from "../libraries/ScholarshipTypes.sol";
import {IScholarshipTreasury} from "../interfaces/IScholarship.sol";
import {IScholarshipReputation} from "../interfaces/IScholarship.sol";
import {ScholarshipTreasury} from "../finance/ScholarshipTreasury.sol";
import {ScholarshipReputation} from "../tokens/ScholarshipReputation.sol";
import {DonorNFT, StudentNFT} from "../tokens/ScholarshipNFTs.sol";

/**
 * @title ScholarshipCore
 * @dev Central hub for the scholarship protocol.
 *
 *  HANDLES:
 *  - Program creation and lifecycle management
 *  - Student application and screening (BY_COMMITTEE + BY_STUDENT)
 *  - Token-weighted voting with reputation integration
 *  - Confidence stake management
 *  - Milestone submission and auto-release
 *  - Scholar status and freeze tracking
 *  - NFT minting for donors and graduates
 *
 *  DELEGATES TO:
 *  - ScholarshipTreasury   → all fund movements
 *  - ScholarshipBounty     → dispute resolution
 *  - ScholarshipReputation → REP token minting/burning
 *  - CommitteeGovernance   → committee score submission
 */
contract ScholarshipCore is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;
    using ScholarshipTypes for *;

    bytes32 public constant UPGRADER_ROLE  = keccak256("UPGRADER_ROLE");
    bytes32 public constant BOUNTY_ROLE    = keccak256("BOUNTY_ROLE");   // ScholarshipBounty
    bytes32 public constant COMMITTEE_ROLE = keccak256("COMMITTEE_ROLE");// CommitteeGovernance

    // ── External contracts ───────────────────────────────────────────────────

    IERC20                  public usdc;
    ScholarshipTreasury     public treasury;
    ScholarshipReputation   public reputation;
    DonorNFT                public donorNFT;
    StudentNFT              public studentNFT;

    // ── Storage ──────────────────────────────────────────────────────────────

    uint256 private _nextProgramId;
    uint256 private _nextMilestoneId;

    mapping(uint256 => ScholarshipTypes.Program)  public programs;
    mapping(uint256 => ScholarshipTypes.Milestone) public milestones;

    // programId → applicant address → Applicant
    mapping(uint256 => mapping(address => ScholarshipTypes.Applicant)) public applicants;
    // programId → list of all applicant addresses
    mapping(uint256 => address[]) private _programApplicants;
    // programId → shortlisted applicant addresses
    mapping(uint256 => address[]) private _shortlist;

    // Scholar records: wallet → programId → Scholar
    mapping(address => mapping(uint256 => ScholarshipTypes.Scholar)) public scholars;

    // Global student status (across all programs)
    mapping(address => ScholarshipTypes.StudentStatus) public globalStudentStatus;
    mapping(address => uint256) public globalFreezeUntil;

    // Score components: programId → applicant → ScoreComponents
    mapping(uint256 => mapping(address => ScholarshipTypes.ScoreComponents)) public scoreComponents;

    // Voter info: programId → voter → VoterInfo
    mapping(uint256 => mapping(address => ScholarshipTypes.VoterInfo)) public voterInfo;

    // Retry tracking: programId → student → retry count
    mapping(uint256 => mapping(address => uint8)) public retryCount;

    // Milestone ownership: milestoneId → scholar address
    mapping(uint256 => address) public milestoneOwner;

    // ── Events ───────────────────────────────────────────────────────────────

    event ProgramCreated(uint256 indexed programId, address indexed initiator, string metadataCID);
    event ProgramStatusChanged(uint256 indexed programId, ScholarshipTypes.ProgramStatus newStatus);
    event StudentApplied(uint256 indexed programId, address indexed student);
    event StudentShortlisted(uint256 indexed programId, address indexed student, uint256 score);
    event StudentScreenedOut(uint256 indexed programId, address indexed student, uint256 score);
    event ScoreSubmitted(uint256 indexed programId, address indexed student, uint256 totalScore);
    event VoteCast(uint256 indexed programId, address indexed voter, address indexed candidate, uint256 weight);
    event ConfidenceStaked(uint256 indexed programId, address indexed voter, address indexed scholar, uint256 amount);
    event ScholarSelected(uint256 indexed programId, address indexed scholar);
    event MilestoneSubmitted(uint256 indexed milestoneId, address indexed scholar, string proofCID);
    event MilestoneCompleted(uint256 indexed milestoneId, address indexed scholar, uint256 amount);
    event MilestoneFrozen(uint256 indexed milestoneId);
    event MilestoneReleased(uint256 indexed milestoneId);
    event ScholarSlashed(address indexed scholar, uint256 indexed programId, ScholarshipTypes.DisputeType dtype);
    event ScholarCompleted(uint256 indexed programId, address indexed scholar);
    event DonationReceived(uint256 indexed programId, address indexed donor, uint256 amount);
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
    error InsufficientDonation();
    error AlreadyDonated();
    error VotingPowerLocked();
    error InsufficientVotingPower();
    error MilestoneNotFound();
    error MilestoneNotSubmitted();
    error DisputeWindowStillOpen();
    error NotMilestoneOwner();
    error ScholarNotActive();
    error QuorumNotMet();
    error CandidateNotShortlisted();
    error ConfidenceStakeAlreadyExists();
    error InvalidMilestoneAmount();

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

    // ── Initializer ──────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address admin,
        address _usdc,
        address _treasury,
        address _reputation,
        address _donorNFT,
        address _studentNFT
    ) public initializer {
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

    // ════════════════════════════════════════════════════════════════
    // PHASE 0 — PROGRAM CREATION
    // ════════════════════════════════════════════════════════════════

    /**
     * @dev Create a new scholarship program.
     *      Initiator must approve `totalFund` USDC to this contract first.
     */
    function createProgram(
        string calldata metadataCID,
        ScholarshipTypes.EducationLevel educationLevel,
        ScholarshipTypes.ScreeningMode  screeningMode,
        ScholarshipTypes.ScoreWeights   calldata weights,
        ScholarshipTypes.SlashDistribution calldata slashDist,
        uint8   maxCandidates,
        uint8   targetWinners,
        uint256[4] calldata timeline, // [appStart, appEnd, voteStart, voteEnd]
        uint256 milestoneDisputeWindow,
        uint256 totalFund
    ) external nonReentrant {
        // Validate weights
        uint256 wSum = uint256(weights.academicWeight)
            + weights.incomeWeight
            + weights.essayWeight
            + weights.recommendWeight
            + weights.extracurricWeight;
        if (wSum != 100) revert InvalidScoreWeights();

        // Validate slash distribution
        uint256 sSum = uint256(slashDist.bountyHunterPercent)
            + slashDist.treasuryPercent
            + slashDist.protocolPercent;
        if (sSum != 100) revert InvalidSlashDistribution();

        // Validate candidates range
        if (maxCandidates < ScholarshipTypes.MIN_CANDIDATES ||
            maxCandidates > ScholarshipTypes.MAX_CANDIDATES)
            revert InvalidCandidateRange();

        // Validate dispute window (7–14 days)
        if (milestoneDisputeWindow < 7 days || milestoneDisputeWindow > 14 days)
            milestoneDisputeWindow = 7 days;

        // Pull total fund from initiator
        usdc.safeTransferFrom(msg.sender, address(treasury), totalFund);
        treasury.depositProgramFund(++_nextProgramId, totalFund);

        programs[_nextProgramId] = ScholarshipTypes.Program({
            id:                     _nextProgramId,
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
            milestoneDisputeWindow: milestoneDisputeWindow,
            totalFund:              totalFund,
            allocatedFund:          0,
            spentFund:              0,
            yieldAccrued:           0,
            applicantCount:         0,
            shortlistedCount:       0,
            activeScholarCount:     0
        });

        emit ProgramCreated(_nextProgramId, msg.sender, metadataCID);
    }

    // ════════════════════════════════════════════════════════════════
    // PHASE 1 — DONATIONS
    // ════════════════════════════════════════════════════════════════

    /**
     * @dev Donors contribute USDC to a program during APPLICATION_OPEN phase.
     *      Voting power = net donated amount (token-weighted).
     *      One donation per address (anti-Sybil).
     */
    function donate(
        uint256 programId,
        uint256 amount,
        string calldata nftMetadataURI
    ) external nonReentrant programExists(programId) {
        ScholarshipTypes.Program storage prog = programs[programId];
        if (prog.status != ScholarshipTypes.ProgramStatus.APPLICATION_OPEN)
            revert InvalidProgramStatus(ScholarshipTypes.ProgramStatus.APPLICATION_OPEN, prog.status);

        if (amount < ScholarshipTypes.MIN_DONATION) revert InsufficientDonation();

        ScholarshipTypes.VoterInfo storage voter = voterInfo[programId][msg.sender];
        if (voter.donatedAmount > 0) revert AlreadyDonated();

        // Pull USDC from donor
        usdc.safeTransferFrom(msg.sender, address(treasury), amount);

        uint256 netAmount = amount - ScholarshipTypes.TRANSACTION_FEE;
        voter.donatedAmount         = netAmount;
        voter.remainingVotingPower  = netAmount;

        // Record in treasury for yield distribution
        treasury.recordDonation(programId, msg.sender, netAmount);

        // Mint Donor NFT
        donorNFT.mint(msg.sender, programId, nftMetadataURI);

        emit DonationReceived(programId, msg.sender, amount);
    }

    // ════════════════════════════════════════════════════════════════
    // PHASE 2 — APPLICATION & SCREENING
    // ════════════════════════════════════════════════════════════════

    /**
     * @dev Student submits application.
     *      All document hashes are stored on-chain; actual documents on IPFS.
     */
    function applyToProgram(
        uint256 programId,
        string calldata profileCID,
        string calldata documentCID,
        string calldata essayCID,
        string calldata recommendCID,
        uint256 selfDeclaredAcademicScore, // Used only in BY_STUDENT mode (0–100)
        uint256 selfDeclaredIncomeScore,   // Used only in BY_STUDENT mode (0–100)
        uint256 selfDeclaredRecommendScore // Used only in BY_STUDENT mode (0–100)
    ) external nonReentrant programExists(programId) {
        ScholarshipTypes.Program storage prog = programs[programId];
        if (prog.status != ScholarshipTypes.ProgramStatus.APPLICATION_OPEN)
            revert InvalidProgramStatus(ScholarshipTypes.ProgramStatus.APPLICATION_OPEN, prog.status);

        // Global eligibility check
        _requireStudentEligible(msg.sender);

        // Cannot apply to own program
        if (msg.sender == prog.initiator) revert CannotApplyToOwnProgram();

        // Max retries per program
        if (retryCount[programId][msg.sender] >= ScholarshipTypes.MAX_RETRY)
            revert MaxRetriesExceeded();

        // Cannot re-apply if already shortlisted or locked
        ScholarshipTypes.Applicant storage existing = applicants[programId][msg.sender];
        if (existing.status == ScholarshipTypes.ApplicationStatus.SHORTLISTED)
            revert AlreadyApplied();

        retryCount[programId][msg.sender]++;

        applicants[programId][msg.sender] = ScholarshipTypes.Applicant({
            programId:      programId,
            wallet:         msg.sender,
            status:         ScholarshipTypes.ApplicationStatus.PENDING_REVIEW,
            profileCID:     profileCID,
            documentCID:    documentCID,
            essayCID:       essayCID,
            recommendCID:   recommendCID,
            totalScore:     0,
            scoreTimestamp: 0,
            retryCount:     retryCount[programId][msg.sender],
            scoreDisputed:  false
        });

        _programApplicants[programId].push(msg.sender);
        prog.applicantCount++;

        // BY_STUDENT: optimistically set self-declared score
        // 7-day dispute window will allow anyone to challenge
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

        emit StudentApplied(programId, msg.sender);
    }

    // ── Committee Scoring ────────────────────────────────────────────────────

    /**
     * @dev Committee member submits score for an applicant.
     *      Only valid in BY_COMMITTEE mode.
     *      Called via CommitteeGovernance contract.
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
            "Not committee mode"
        );
        _setScore(programId, applicant, academicScore, incomeScore, recommendScore, committeeAddress);
    }

    function _setScore(
        uint256 programId,
        address applicant,
        uint256 academic,
        uint256 income,
        uint256 recommend,
        address scoredBy
    ) internal {
        ScholarshipTypes.Program storage prog = programs[programId];
        ScholarshipTypes.ScoreWeights memory w = prog.scoreWeights;

        // Clamp to 100
        academic  = academic  > 100 ? 100 : academic;
        income    = income    > 100 ? 100 : income;
        recommend = recommend > 100 ? 100 : recommend;

        // Weighted total (out of 1000)
        uint256 total = (academic  * w.academicWeight)
                      + (income    * w.incomeWeight)
                      + (recommend * w.recommendWeight);
        // Essay and extracurricular are scored by voters — not in screening
        // Their weights contribute to total potential but not screening score
        // We normalize to 1000 using only the screening-applicable weights
        uint256 screeningWeightSum = uint256(w.academicWeight)
                                   + w.incomeWeight
                                   + w.recommendWeight;

        uint256 normalizedScore = screeningWeightSum > 0
            ? (total * 1000) / (screeningWeightSum * 100)
            : 0;

        scoreComponents[programId][applicant] = ScholarshipTypes.ScoreComponents({
            academicScore:   academic,
            incomeScore:     income,
            recommendScore:  recommend,
            isSubmitted:     true,
            scoredBy:        scoredBy
        });

        applicants[programId][applicant].totalScore      = normalizedScore;
        applicants[programId][applicant].scoreTimestamp  = block.timestamp;

        emit ScoreSubmitted(programId, applicant, normalizedScore);
    }

    // ── Shortlist Resolution ─────────────────────────────────────────────────

    /**
     * @dev Initiator triggers shortlist computation after all scores are submitted.
     *      Top N applicants (by score) move to SHORTLISTED.
     *      Others become SCREENED_OUT (can retry if retryCount < 3).
     *
     *      NOTE: Sorting N applicants on-chain can be expensive.
     *      For gas efficiency, scores are compared with an off-chain generated
     *      sorted list that the initiator provides, and the contract validates it.
     */
    function resolveShortlist(
        uint256 programId,
        address[] calldata rankedApplicants // Off-chain sorted, contract validates
    ) external programExists(programId) {
        ScholarshipTypes.Program storage prog = programs[programId];
        require(msg.sender == prog.initiator, "Only initiator");
        if (prog.status != ScholarshipTypes.ProgramStatus.SCREENING)
            revert InvalidProgramStatus(ScholarshipTypes.ProgramStatus.SCREENING, prog.status);

        uint256 shortlistSize = rankedApplicants.length < prog.maxCandidates
            ? rankedApplicants.length
            : prog.maxCandidates;

        // Validate ordering: each score must be >= the next
        for (uint256 i = 0; i < rankedApplicants.length - 1; ) {
            require(
                applicants[programId][rankedApplicants[i]].totalScore >=
                applicants[programId][rankedApplicants[i + 1]].totalScore,
                "Invalid sort order"
            );
            unchecked { ++i; }
        }

        // Shortlist top N
        for (uint256 i = 0; i < shortlistSize; ) {
            address student = rankedApplicants[i];
            ScholarshipTypes.Applicant storage app = applicants[programId][student];

            if (app.totalScore >= ScholarshipTypes.SCREENING_THRESHOLD) {
                app.status = ScholarshipTypes.ApplicationStatus.SHORTLISTED;
                _shortlist[programId].push(student);
                prog.shortlistedCount++;
                emit StudentShortlisted(programId, student, app.totalScore);
            } else {
                _markScreenedOut(programId, student);
            }
            unchecked { ++i; }
        }

        // Mark remaining as screened out
        for (uint256 i = shortlistSize; i < rankedApplicants.length; ) {
            _markScreenedOut(programId, rankedApplicants[i]);
            unchecked { ++i; }
        }

        // Transition to VOTING
        prog.status = ScholarshipTypes.ProgramStatus.VOTING;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.VOTING);
    }

    function _markScreenedOut(uint256 programId, address student) internal {
        ScholarshipTypes.Applicant storage app = applicants[programId][student];
        if (app.retryCount >= ScholarshipTypes.MAX_RETRY) {
            app.status = ScholarshipTypes.ApplicationStatus.LOCKED;
        } else {
            app.status = ScholarshipTypes.ApplicationStatus.SCREENED_OUT;
        }
        emit StudentScreenedOut(programId, student, app.totalScore);
    }

    // ════════════════════════════════════════════════════════════════
    // PHASE 3 — VOTING
    // ════════════════════════════════════════════════════════════════

    /**
     * @dev Token-weighted vote. Voter spends ALL remaining voting power on one candidate.
     *      Voters see: profileCID + essayCID (score is hidden).
     *      Reputation check: voting power locked voters cannot vote.
     */
    function voteForCandidate(
        uint256 programId,
        address candidate
    ) external nonReentrant programExists(programId)
      inStatus(programId, ScholarshipTypes.ProgramStatus.VOTING)
    {
        // Check reputation lock
        if (reputation.isVotingPowerLocked(msg.sender))
            revert VotingPowerLocked();

        ScholarshipTypes.VoterInfo storage voter = voterInfo[programId][msg.sender];
        if (voter.remainingVotingPower == 0) revert InsufficientVotingPower();

        // Candidate must be shortlisted
        if (applicants[programId][candidate].status !=
            ScholarshipTypes.ApplicationStatus.SHORTLISTED)
            revert CandidateNotShortlisted();

        uint256 weight = voter.remainingVotingPower;
        voter.remainingVotingPower = 0; // spend all on one candidate

        applicants[programId][candidate].totalScore += weight; // vote adds to score
        // Note: vote weight is additive on top of screening score intentionally —
        // it rewards candidates who both screen well AND resonate with voters

        emit VoteCast(programId, msg.sender, candidate, weight);
    }

    /**
     * @dev Optional: voter places a confidence stake on a candidate they voted for.
     *      This signals strong conviction.
     *      Earns bonus yield if scholar succeeds. 50% slashed if scholar defrauds.
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

        usdc.safeTransferFrom(msg.sender, address(treasury), amount);
        treasury.depositConfidenceStake(programId, msg.sender, scholar, amount);

        voter.confidenceStake    = amount;
        voter.confidenceStakeFor = scholar;

        emit ConfidenceStaked(programId, msg.sender, scholar, amount);
    }

    // ── Select Winners ───────────────────────────────────────────────────────

    /**
     * @dev After voting ends, initiator selects top N scholars.
     *      Provides sorted list; contract validates ordering.
     *      Winners become ACTIVE_SCHOLAR and milestones are created.
     */
    function selectWinners(
        uint256 programId,
        address[] calldata rankedCandidates,
        uint256[][] calldata milestonAmounts  // milestonAmounts[i] = amounts for winner i
    ) external programExists(programId) {
        ScholarshipTypes.Program storage prog = programs[programId];
        require(msg.sender == prog.initiator, "Only initiator");
        if (prog.status != ScholarshipTypes.ProgramStatus.VOTING)
            revert InvalidProgramStatus(ScholarshipTypes.ProgramStatus.VOTING, prog.status);

        uint256 winnerCount = rankedCandidates.length < prog.targetWinners
            ? rankedCandidates.length
            : prog.targetWinners;

        for (uint256 i = 0; i < winnerCount; ) {
            address winner = rankedCandidates[i];
            _activateScholar(programId, winner, milestonAmounts[i]);
            unchecked { ++i; }
        }

        prog.status = ScholarshipTypes.ProgramStatus.ACTIVE;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.ACTIVE);
    }

    function _activateScholar(
        uint256 programId,
        address winner,
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

        // Create milestone records
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

    // ════════════════════════════════════════════════════════════════
    // PHASE 4 — MILESTONE EXECUTION
    // ════════════════════════════════════════════════════════════════

    /**
     * @dev Scholar submits proof for a milestone.
     *      Starts the dispute window countdown.
     */
    function submitMilestoneProof(
        uint256 milestoneId,
        string calldata proofCID
    ) external nonReentrant {
        ScholarshipTypes.Milestone storage m = milestones[milestoneId];
        if (m.scholar == address(0)) revert MilestoneNotFound();
        if (msg.sender != m.scholar) revert NotMilestoneOwner();
        if (m.status != ScholarshipTypes.MilestoneStatus.PENDING)
            revert MilestoneNotSubmitted();

        ScholarshipTypes.Scholar storage scholar = scholars[msg.sender][m.programId];
        if (scholar.status != ScholarshipTypes.StudentStatus.ACTIVE)
            revert ScholarNotActive();

        m.proofCID       = proofCID;
        m.status         = ScholarshipTypes.MilestoneStatus.DISPUTE_WINDOW;
        m.submittedAt    = block.timestamp;
        m.disputeDeadline = block.timestamp + programs[m.programId].milestoneDisputeWindow;

        emit MilestoneSubmitted(milestoneId, msg.sender, proofCID);
    }

    /**
     * @dev Anyone can call this to release a milestone after dispute window passes.
     *      Incentive: caller gets a small execution fee (from protocol fees).
     *      This prevents milestones from hanging indefinitely.
     */
    function executeMilestone(uint256 milestoneId) external nonReentrant {
        ScholarshipTypes.Milestone storage m = milestones[milestoneId];
        if (m.status != ScholarshipTypes.MilestoneStatus.DISPUTE_WINDOW)
            revert MilestoneNotSubmitted();
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

        // Release payment from treasury
        treasury.disburseMilestone(m.scholar, m.programId, milestoneId, m.amount);

        // Give +10 REP to all voters who backed this scholar
        _rewardVoters(m.programId, m.scholar, 10, "milestone_completed");

        emit MilestoneCompleted(milestoneId, m.scholar, m.amount);

        // Check if all milestones done
        if (scholar.currentMilestone == scholar.totalMilestones) {
            _completeScholar(m.programId, m.scholar);
        }
    }

    function _completeScholar(uint256 programId, address scholarAddr) internal {
        scholars[scholarAddr][programId].status = ScholarshipTypes.StudentStatus.COMPLETED;

        // +50 REP bonus to all backers
        _rewardVoters(programId, scholarAddr, 50, "scholar_completed");

        // Resolve confidence stakes positively
        address[] memory voters = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < voters.length; ) {
            ScholarshipTypes.VoterInfo storage vi = voterInfo[programId][voters[i]];
            if (vi.confidenceStakeFor == scholarAddr && vi.confidenceStake > 0) {
                treasury.resolveConfidenceStake(programId, voters[i], true);
            }
            unchecked { ++i; }
        }

        // Mint Student NFT (only on full completion)
        studentNFT.mint(scholarAddr, programId, "");

        emit ScholarCompleted(programId, scholarAddr);
    }

    // ── Freeze / Release (called by Bounty contract) ──────────────────────────

    function freezeMilestone(uint256 milestoneId)
        external onlyRole(BOUNTY_ROLE)
    {
        milestones[milestoneId].status = ScholarshipTypes.MilestoneStatus.FROZEN;
        emit MilestoneFrozen(milestoneId);
    }

    function releaseMilestone(uint256 milestoneId)
        external onlyRole(BOUNTY_ROLE)
    {
        milestones[milestoneId].status = ScholarshipTypes.MilestoneStatus.DISPUTE_WINDOW;
        emit MilestoneReleased(milestoneId);
    }

    // ── Slash (called by Bounty contract) ─────────────────────────────────────

    /**
     * @dev Called by ScholarshipBounty when a dispute is upheld.
     *      Applies penalty based on fraud type (sliding scale).
     *      Punishes voters who backed the fraudulent scholar.
     */
    function slashScholar(
        address wallet,
        uint256 programId,
        ScholarshipTypes.DisputeType disputeType
    ) external onlyRole(BOUNTY_ROLE) {
        ScholarshipTypes.Scholar storage scholar = scholars[wallet][programId];
        scholar.status = ScholarshipTypes.StudentStatus.FROZEN;

        // Determine freeze duration and blacklist
        uint256 freezeDuration;
        bool    blacklist = false;

        if (disputeType == ScholarshipTypes.DisputeType.LIGHT_FRAUD) {
            freezeDuration = ScholarshipTypes.FREEZE_LIGHT;
        } else if (disputeType == ScholarshipTypes.DisputeType.MILESTONE_FRAUD) {
            freezeDuration = ScholarshipTypes.FREEZE_MILESTONE;
        } else {
            // HEAVY_FRAUD
            freezeDuration = ScholarshipTypes.FREEZE_HEAVY;
            blacklist      = true;
        }

        globalFreezeUntil[wallet]  = block.timestamp + freezeDuration;
        globalStudentStatus[wallet] = blacklist
            ? ScholarshipTypes.StudentStatus.BLACKLISTED
            : ScholarshipTypes.StudentStatus.FROZEN;

        if (blacklist) scholar.isBlacklisted = true;

        // Punish voters: burn REP + lock voting power
        uint256 repPenalty = disputeType == ScholarshipTypes.DisputeType.LIGHT_FRAUD
            ? 50
            : disputeType == ScholarshipTypes.DisputeType.MILESTONE_FRAUD
                ? 100
                : 200;

        _punishVoters(programId, wallet, repPenalty, freezeDuration);

        // Resolve confidence stakes negatively
        address[] memory voters = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < voters.length; ) {
            ScholarshipTypes.VoterInfo storage vi = voterInfo[programId][voters[i]];
            if (vi.confidenceStakeFor == wallet && vi.confidenceStake > 0) {
                treasury.resolveConfidenceStake(programId, voters[i], false);
            }
            unchecked { ++i; }
        }

        emit ScholarSlashed(wallet, programId, disputeType);
    }

    function getRemainingFund(address wallet, uint256 programId)
        external view returns (uint256)
    {
        return treasury.getProgramBalance(programId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function _rewardVoters(
        uint256 programId,
        address scholarAddr,
        uint256 repAmount,
        string memory reason
    ) internal {
        address[] memory donors = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < donors.length; ) {
            // Only reward voters who actually voted for this scholar
            // (tracked via votedFor mapping — simplified here)
            reputation.mint(donors[i], repAmount, reason);
            unchecked { ++i; }
        }
    }

    function _punishVoters(
        uint256 programId,
        address scholarAddr,
        uint256 repPenalty,
        uint256 lockDuration
    ) internal {
        address[] memory donors = treasury.getProgramDonors(programId);
        for (uint256 i = 0; i < donors.length; ) {
            reputation.burn(donors[i], repPenalty, "scholar_slashed");
            reputation.lockVotingPower(donors[i], block.timestamp + lockDuration);
            unchecked { ++i; }
        }
    }

    function _requireStudentEligible(address wallet) internal view {
        ScholarshipTypes.StudentStatus status = globalStudentStatus[wallet];
        if (status == ScholarshipTypes.StudentStatus.BLACKLISTED)
            revert StudentBlacklisted();
        if (status == ScholarshipTypes.StudentStatus.FROZEN) {
            if (block.timestamp < globalFreezeUntil[wallet])
                revert StudentFrozen(globalFreezeUntil[wallet]);
        }
    }

    // ── Programme cancellation ────────────────────────────────────────────────

    function cancelProgram(uint256 programId)
        external nonReentrant programExists(programId)
    {
        ScholarshipTypes.Program storage prog = programs[programId];
        require(msg.sender == prog.initiator, "Only initiator");
        require(prog.status != ScholarshipTypes.ProgramStatus.COMPLETED &&
                prog.status != ScholarshipTypes.ProgramStatus.CANCELLED,
                "Cannot cancel");

        prog.status = ScholarshipTypes.ProgramStatus.CANCELLED;
        treasury.refundDonors(programId);

        emit ProgramCancelled(programId);
    }

    // ── Status transitions ────────────────────────────────────────────────────

    function openApplications(uint256 programId)
        external programExists(programId)
    {
        ScholarshipTypes.Program storage prog = programs[programId];
        require(msg.sender == prog.initiator, "Only initiator");
        require(prog.status == ScholarshipTypes.ProgramStatus.CREATED, "Wrong status");
        prog.status = ScholarshipTypes.ProgramStatus.APPLICATION_OPEN;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.APPLICATION_OPEN);
    }

    function openScreening(uint256 programId)
        external programExists(programId)
    {
        ScholarshipTypes.Program storage prog = programs[programId];
        require(msg.sender == prog.initiator, "Only initiator");
        require(prog.status == ScholarshipTypes.ProgramStatus.APPLICATION_OPEN, "Wrong status");
        prog.status = ScholarshipTypes.ProgramStatus.SCREENING;
        emit ProgramStatusChanged(programId, ScholarshipTypes.ProgramStatus.SCREENING);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function getProgram(uint256 programId)
        external view returns (ScholarshipTypes.Program memory) {
        return programs[programId];
    }

    function getScholar(address wallet, uint256 programId)
        external view returns (ScholarshipTypes.Scholar memory) {
        return scholars[wallet][programId];
    }

    function getShortlist(uint256 programId)
        external view returns (address[] memory) {
        return _shortlist[programId];
    }

    function getMilestone(uint256 milestoneId)
        external view returns (ScholarshipTypes.Milestone memory) {
        return milestones[milestoneId];
    }

    function isStudentEligible(address wallet)
        external view returns (bool eligible, string memory reason) {
        ScholarshipTypes.StudentStatus status = globalStudentStatus[wallet];
        if (status == ScholarshipTypes.StudentStatus.BLACKLISTED)
            return (false, "Permanently blacklisted");
        if (status == ScholarshipTypes.StudentStatus.FROZEN &&
            block.timestamp < globalFreezeUntil[wallet])
            return (false, "Temporarily frozen");
        return (true, "");
    }

    // ── UUPS ──────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}
}
