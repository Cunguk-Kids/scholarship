// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScholarshipTypes
 * @dev Central library for all shared types, enums, and constants.
 *      Keeping all types here prevents circular imports and makes
 *      the system easy to audit.
 */
library ScholarshipTypes {

    // ════════════════════════════════════════════════════════════════
    // ENUMS
    // ════════════════════════════════════════════════════════════════

    enum EducationLevel {
        SD,           // Elementary
        SMP,          // Junior High
        SMA,          // Senior High / Vocational
        UNIVERSITY
    }

    enum ScreeningMode {
        BY_COMMITTEE, // Committee members manually score each applicant
        BY_STUDENT    // Student self-reports, optimistic 7-day challenge window
    }

    enum ProgramStatus {
        CREATED,
        APPLICATION_OPEN,
        SCREENING,
        VOTING,
        ACTIVE,       // Scholars selected, milestones running
        COMPLETED,
        CANCELLED
    }

    enum ApplicationStatus {
        PENDING_REVIEW,
        SHORTLISTED,
        SCREENED_OUT,
        LOCKED        // Used up all 3 retries for this program
    }

    enum MilestoneStatus {
        PENDING,
        SUBMITTED,
        DISPUTE_WINDOW,   // Submitted, waiting for dispute window to pass
        DISPUTED,         // Bounty hunter raised a dispute
        COMPLETED,        // Cleared — funds released to student
        FROZEN            // Frozen due to active dispute
    }

    enum DisputeType {
        LIGHT_FRAUD,       // Fake/misleading documents → 6 month freeze
        MILESTONE_FRAUD,   // Fabricated milestone proof → 1 year freeze
        HEAVY_FRAUD        // Fraud + already withdrew funds → 2 year freeze + blacklist
    }

    enum DisputeStatus {
        ACTIVE,
        STUDENT_CONCEDED,
        AUTO_GUILTY,       // Student did not respond in 7 days
        BH_WON,
        BH_LOST
    }

    enum StudentStatus {
        ACTIVE,
        COMPLETED,
        FROZEN,            // Temporary ban
        BLACKLISTED        // Permanent ban (HEAVY_FRAUD)
    }

    // ════════════════════════════════════════════════════════════════
    // STRUCTS — PROGRAM
    // ════════════════════════════════════════════════════════════════

    /**
     * @dev Score weights for screening. Must sum to 100.
     */
    struct ScoreWeights {
        uint8 academicWeight;     // GPA / report card
        uint8 incomeWeight;       // Family income bracket
        uint8 essayWeight;        // Essay (assessed by voters, not screeners)
        uint8 recommendWeight;    // Recommendation letter
        uint8 extracurricWeight;  // Extra-curricular (optional, can be 0)
        // Sum must equal 100 — enforced at program creation
    }

    /**
     * @dev Slash distribution percentages. Must sum to 100.
     */
    struct SlashDistribution {
        uint8 bountyHunterPercent; // Reward for valid dispute
        uint8 treasuryPercent;     // Returns to program treasury
        uint8 protocolPercent;     // Protocol sustainability fee
    }

    /**
     * @dev Full program configuration set by initiator.
     */
    struct Program {
        uint256 id;
        address initiator;
        string  metadataCID;         // IPFS: program description, essay questions
        EducationLevel educationLevel;
        ScreeningMode  screeningMode;
        ProgramStatus  status;
        ScoreWeights   scoreWeights;
        SlashDistribution slashDist;

        // Capacity
        uint8   maxCandidates;       // 5–20 shortlisted candidates
        uint8   targetWinners;       // How many scholars win

        // Timeline (unix timestamps)
        uint256 applicationStart;
        uint256 applicationEnd;
        uint256 votingStart;
        uint256 votingEnd;
        uint256 milestoneDisputeWindow; // seconds (7–14 days)

        // Financial
        uint256 totalFund;           // Total USDC locked at creation
        uint256 allocatedFund;       // Committed to active scholars
        uint256 spentFund;           // Already paid out to scholars
        uint256 yieldAccrued;        // Yield from treasury integration

        // Counters
        uint256 applicantCount;
        uint256 shortlistedCount;
        uint256 activeScholarCount;
    }

    // ════════════════════════════════════════════════════════════════
    // STRUCTS — APPLICANT / SCHOLAR
    // ════════════════════════════════════════════════════════════════

    struct Applicant {
        uint256 programId;
        address wallet;
        ApplicationStatus status;
        string  profileCID;       // IPFS: identity, photo, bio
        string  documentCID;      // IPFS: report card, income proof
        string  essayCID;         // IPFS: essay answers
        string  recommendCID;     // IPFS: recommendation letter
        uint256 totalScore;       // 0–1000 weighted score
        uint256 scoreTimestamp;   // When score was confirmed
        uint8   retryCount;       // Max 3 per program
        bool    scoreDisputed;    // True if score under dispute
    }

    struct ScoreComponents {
        uint256 academicScore;    // 0–100 raw
        uint256 incomeScore;      // 0–100 raw
        uint256 recommendScore;   // 0–100 raw
        bool    isSubmitted;
        address scoredBy;         // Committee member address (or student if BY_STUDENT)
    }

    /**
     * @dev Scholar record — created when applicant wins voting.
     */
    struct Scholar {
        uint256 programId;
        address wallet;
        StudentStatus status;
        uint256 freezeUntil;      // Unix timestamp, 0 if not frozen
        bool    isBlacklisted;    // Permanent — set on HEAVY_FRAUD
        uint256 currentMilestone;
        uint256 totalMilestones;
        uint256 totalReceived;    // Total USDC received so far
    }

    // ════════════════════════════════════════════════════════════════
    // STRUCTS — MILESTONE
    // ════════════════════════════════════════════════════════════════

    struct Milestone {
        uint256 id;
        uint256 programId;
        address scholar;
        uint256 amount;           // USDC amount for this milestone
        string  descriptionCID;   // What this milestone requires
        string  proofCID;         // Student-submitted proof (IPFS)
        MilestoneStatus status;
        uint256 submittedAt;
        uint256 disputeDeadline;  // submittedAt + milestoneDisputeWindow
        uint256 completedAt;
        bool    isFirstMilestone; // Can be claimed early (during VOTING phase)
    }

    // ════════════════════════════════════════════════════════════════
    // STRUCTS — VOTING
    // ════════════════════════════════════════════════════════════════

    struct VoterInfo {
        uint256 donatedAmount;        // Net USDC donated (after fee)
        uint256 remainingVotingPower; // Decrements on each vote
        uint256 confidenceStake;      // Optional extra USDC staked on a scholar
        address confidenceStakeFor;   // Which scholar they confidence-staked on
        bool    hasClaimedYield;
        uint256 reputationScore;      // Tracked in RepToken but cached here
    }

    struct ConfidenceStake {
        address voter;
        address scholar;
        uint256 programId;
        uint256 amount;
        bool    isResolved;
        bool    slashed;          // True if scholar was fraudulent
    }

    // ════════════════════════════════════════════════════════════════
    // STRUCTS — BOUNTY HUNTER
    // ════════════════════════════════════════════════════════════════

    struct Dispute {
        uint256 id;
        uint256 programId;
        address scholar;
        uint256 milestoneId;      // 0 if program-level dispute (not milestone-specific)
        address bountyHunter;
        DisputeType disputeType;
        DisputeStatus status;
        string  evidenceCID;      // BH's evidence (IPFS)
        string  counterEvidenceCID; // Student's counter (IPFS)
        uint256 stake;            // BH stake amount
        uint256 potentialReward;  // 20% of remaining scholar funds at time of dispute
        uint256 raisedAt;
        uint256 defenseDeadline;  // raisedAt + 7 days
        uint256 resolvedAt;
        address resolvedBy;       // Committee member who resolved
    }

    struct BountyHunterRecord {
        uint256 activeDisputeId;      // 0 if no active dispute
        uint256 cooldownUntil;        // Cannot raise new dispute before this
        uint256 totalWins;
        uint256 totalLosses;
        uint256 consecutiveLosses;    // Resets on win; triggers flag at 3
        bool    isFlagged;            // BAD_ACTOR flag
    }

    // ════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ════════════════════════════════════════════════════════════════

    uint256 constant MIN_DONATION         = 50  * 1e6;  // 50 USDC
    uint256 constant TRANSACTION_FEE      = 10  * 1e6;  // 10 USDC flat fee
    uint256 constant MIN_CANDIDATES       = 5;
    uint256 constant MAX_CANDIDATES       = 20;
    uint256 constant MAX_RETRY            = 3;
    uint256 constant DEFENSE_WINDOW       = 7 days;
    uint256 constant BH_COOLDOWN_NORMAL   = 30 days;
    uint256 constant BH_COOLDOWN_FLAGGED  = 90 days;
    uint256 constant BH_STAKE_PERCENT     = 10;         // 10% of potential reward
    uint256 constant FREEZE_LIGHT         = 180 days;   // 6 months
    uint256 constant FREEZE_MILESTONE     = 365 days;   // 1 year
    uint256 constant FREEZE_HEAVY         = 730 days;   // 2 years
    uint256 constant SCORE_MAX            = 1000;
    uint256 constant SCREENING_THRESHOLD  = 600;        // Min score to be shortlisted
}
