// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  ScholarshipTypes
 * @author Scholarship Protocol
 * @notice Single source of truth for every shared type in the system.
 *         Keeping all types here prevents circular imports and makes
 *         the entire protocol easy to audit in one read.
 *
 * @dev    Library (not a contract) so it costs nothing to import and
 *         all values are inlined by the compiler.
 */
library ScholarshipTypes {

    // ═══════════════════════════════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════════════════════════════

    /// @notice Education level for which a program is designed.
    enum EducationLevel {
        SD,          // Elementary school
        SMP,         // Junior high school
        SMA,         // Senior high / vocational
        UNIVERSITY   // Undergraduate / graduate
    }

    /**
     * @notice Determines how applicants are scored.
     * BY_COMMITTEE – assigned committee members review docs and submit scores.
     * BY_STUDENT   – student self-reports; scores enter a 7-day optimistic window
     *                during which anyone may challenge with counter-evidence.
     */
    enum ScreeningMode {
        BY_COMMITTEE,
        BY_STUDENT
    }

    /// @notice High-level lifecycle state of a program.
    enum ProgramStatus {
        CREATED,           // Deployed, not yet open for applications
        APPLICATION_OPEN,  // Students may apply; donors may contribute
        SCREENING,         // Committee/self-score window
        VOTING,            // Token-weighted donor voting
        ACTIVE,            // Scholars selected; milestones running
        COMPLETED,         // All milestones done
        CANCELLED          // Cancelled; donors refunded
    }

    /// @notice Per-applicant state within a program.
    enum ApplicationStatus {
        PENDING_REVIEW,    // Submitted, awaiting score
        SHORTLISTED,       // In top N — advances to voting
        SCREENED_OUT,      // Below threshold — may retry (if retries remain)
        LOCKED             // Used all 3 retries for this program
    }

    /// @notice Per-milestone lifecycle.
    enum MilestoneStatus {
        PENDING,           // Not yet submitted
        SUBMITTED,         // Submitted; dispute window active
        DISPUTED,          // Bounty hunter raised dispute; frozen
        COMPLETED,         // Cleared — funds released
        FROZEN             // Hard freeze (active dispute)
    }

    /**
     * @notice Severity of fraud alleged by a bounty hunter.
     * Determines freeze duration and whether blacklist is applied.
     */
    enum DisputeType {
        LIGHT_FRAUD,       // Misleading / incomplete docs   → 6-month freeze
        MILESTONE_FRAUD,   // Fabricated milestone proof     → 1-year freeze
        HEAVY_FRAUD        // Fraud + funds already drawn    → 2-year freeze + blacklist
    }

    /// @notice State machine for a bounty-hunter dispute.
    enum DisputeStatus {
        ACTIVE,            // Raised; waiting for student response or expiry
        STUDENT_CONCEDED,  // Scholar admitted guilt voluntarily
        AUTO_GUILTY,       // Defense window expired with no response
        BH_WON,            // Committee ruled in favour of bounty hunter
        BH_LOST            // Committee ruled in favour of scholar
    }

    /// @notice Global status for a student wallet across all programs.
    enum StudentStatus {
        ACTIVE,
        COMPLETED,
        FROZEN,            // Temporary ban (duration set by disputeType)
        BLACKLISTED        // Permanent ban — HEAVY_FRAUD only
    }

    // ═══════════════════════════════════════════════════════════════════
    // STRUCTS — PROGRAM
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Weighted scoring dimensions for applicant screening.
     *         academicWeight + incomeWeight + essayWeight + recommendWeight
     *         + extracurricWeight MUST equal 100.
     *
     * @dev    essayWeight is assessed by voters during voting, not by
     *         committee screeners — it adds a motivational dimension.
     */
    struct ScoreWeights {
        uint8 academicWeight;     // GPA / report card
        uint8 incomeWeight;       // Family income bracket
        uint8 essayWeight;        // Essay — scored by voters, not screeners
        uint8 recommendWeight;    // Recommendation letter
        uint8 extracurricWeight;  // Extra-curricular (optional, can be 0)
    }

    /**
     * @notice How slash proceeds are split.
     *         bountyHunterPercent + treasuryPercent + protocolPercent = 100.
     */
    struct SlashDistribution {
        uint8 bountyHunterPercent; // Reward for valid dispute (default 20)
        uint8 treasuryPercent;     // Returns to program treasury  (default 70)
        uint8 protocolPercent;     // Protocol sustainability fee  (default 10)
    }

    /**
     * @notice Full on-chain configuration for a scholarship program.
     *         Created once by the initiator; partially mutable during lifecycle.
     */
    struct Program {
        uint256 id;
        address initiator;
        string  metadataCID;          // IPFS: description, essay questions, rules

        EducationLevel    educationLevel;
        ScreeningMode     screeningMode;
        ProgramStatus     status;
        ScoreWeights      scoreWeights;
        SlashDistribution slashDist;

        // ── Capacity ───────────────────────────────────────────────
        uint8   maxCandidates;        // Number of shortlisted candidates (5–20)
        uint8   targetWinners;        // How many scholars receive the grant

        // ── Timeline (unix timestamps) ─────────────────────────────
        uint256 applicationStart;
        uint256 applicationEnd;
        uint256 votingStart;
        uint256 votingEnd;
        uint256 milestoneDisputeWindow; // Seconds (7–14 days)

        // ── Financial ──────────────────────────────────────────────
        uint256 totalFund;            // Total USDC locked at program creation
        uint256 allocatedFund;        // Committed to active scholars
        uint256 spentFund;            // Already paid out
        uint256 yieldAccrued;         // Yield from external protocol (Aave Phase 2)

        // ── Counters ───────────────────────────────────────────────
        uint256 applicantCount;
        uint256 shortlistedCount;
        uint256 activeScholarCount;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STRUCTS — APPLICANT / SCHOLAR
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice On-chain record for one student's application to one program.
     *         All heavy documents stay on IPFS; only CIDs are stored here.
     */
    struct Applicant {
        uint256           programId;
        address           wallet;
        ApplicationStatus status;

        string  profileCID;    // IPFS: identity, photo, bio
        string  documentCID;   // IPFS: report card, income proof, transcripts
        string  essayCID;      // IPFS: essay answers
        string  recommendCID;  // IPFS: recommendation letter

        uint256 screeningScore;   // Weighted score from screening (0–1000)
        uint256 totalScore;       // Same as screeningScore — set once, never modified
        uint256 voteScore;        // Accumulated USDC voting weight (separate dimension)
        uint256 scoreTimestamp;   // Block timestamp when score was confirmed
        uint8   retryCount;       // Increments on each application; max 3
        bool    scoreDisputed;    // True while a score challenge is pending
    }

    /**
     * @notice Score breakdown submitted by a committee member (or student in
     *         BY_STUDENT mode).  Three raw components, 0–100 each.
     */
    struct ScoreComponents {
        uint256 academicScore;
        uint256 incomeScore;
        uint256 recommendScore;
        bool    isSubmitted;
        address scoredBy;      // Committee member or student wallet
    }

    /**
     * @notice Active scholar record — created when a candidate wins the vote.
     *         Tracks milestone progress and global punishment state.
     */
    struct Scholar {
        uint256       programId;
        address       wallet;
        StudentStatus status;
        uint256       freezeUntil;      // Unix timestamp; 0 = not frozen
        bool          isBlacklisted;    // Permanent flag — set only on HEAVY_FRAUD
        uint256       currentMilestone; // Index of next milestone to submit
        uint256       totalMilestones;
        uint256       totalReceived;    // Total USDC disbursed so far
    }

    // ═══════════════════════════════════════════════════════════════════
    // STRUCTS — MILESTONE
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice One disbursement stage for a scholar.
     *         Scholar submits proof → dispute window starts → funds auto-release
     *         if no BH dispute is raised before the deadline.
     */
    struct Milestone {
        uint256         id;
        uint256         programId;
        address         scholar;
        uint256         amount;          // USDC to disburse on completion
        string          descriptionCID;  // What the scholar must deliver
        string          proofCID;        // Scholar-submitted proof (IPFS)
        MilestoneStatus status;
        uint256         submittedAt;
        uint256         disputeDeadline; // submittedAt + program.milestoneDisputeWindow
        uint256         completedAt;
        bool            isFirstMilestone;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STRUCTS — VOTING & CONFIDENCE STAKE
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Tracks a donor's voting position within one program.
     *         Voting power equals net donated USDC (after protocol fee).
     *         All voting power is spent in a single cast (one-vote-one-candidate).
     */
    struct VoterInfo {
        uint256 donatedAmount;        // Net USDC after fee
        uint256 remainingVotingPower; // Decrements to 0 after a vote is cast
        address votedFor;             // Candidate address (address(0) if not voted)
        uint256 confidenceStake;      // Optional extra USDC staked on conviction
        address confidenceStakeFor;   // Scholar the confidence stake backs
        bool    hasClaimedYield;
    }

    /**
     * @notice Optional conviction signal by a voter.
     *         Earns yield bonus if scholar succeeds; partially slashed if fraudulent.
     */
    struct ConfidenceStake {
        address voter;
        address scholar;
        uint256 programId;
        uint256 amount;
        bool    isResolved;
        bool    slashed;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STRUCTS — BOUNTY HUNTER
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Full dispute record raised by a bounty hunter against a scholar.
     *
     * @dev    milestoneId == 0 means the dispute targets the scholar's program
     *         membership in general (e.g. fabricated application), not a specific
     *         milestone.
     */
    struct Dispute {
        uint256       id;
        uint256       programId;
        address       scholar;
        uint256       milestoneId;         // 0 for program-level disputes
        address       bountyHunter;
        DisputeType   disputeType;
        DisputeStatus status;

        string  evidenceCID;               // BH's evidence (IPFS)
        string  counterEvidenceCID;        // Scholar's rebuttal (IPFS)

        uint256 stake;                     // USDC locked by BH
        uint256 potentialReward;           // 20% of scholar's remaining fund at creation

        uint256 raisedAt;
        uint256 defenseDeadline;           // raisedAt + DEFENSE_WINDOW
        uint256 resolvedAt;
        address resolvedBy;                // Committee member who finalised resolution
    }

    /**
     * @notice Anti-spam and track record for a bounty hunter address.
     *         One active dispute at a time; cooldowns escalate on consecutive losses.
     */
    struct BountyHunterRecord {
        uint256 activeDisputeId;       // 0 = no active dispute
        uint256 cooldownUntil;         // Cannot raise new dispute before this timestamp
        uint256 totalWins;
        uint256 totalLosses;
        uint256 consecutiveLosses;     // Resets on win; flags BH at 3
        bool    isFlagged;             // BAD_ACTOR status → extended cooldowns
    }

    // ═══════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════

    uint256 constant MIN_DONATION          = 50  * 1e6;  // 50 USDC (6 decimals)
    uint256 constant TRANSACTION_FEE       = 10  * 1e6;  // 10 USDC flat protocol fee
    uint256 constant MIN_CANDIDATES        = 5;
    uint256 constant MAX_CANDIDATES        = 20;
    uint256 constant MAX_RETRY             = 3;           // Max re-applications per program
    uint256 constant DEFENSE_WINDOW        = 7 days;      // Scholar response window
    uint256 constant BH_COOLDOWN_NORMAL    = 30 days;     // Cooldown after losing a dispute
    uint256 constant BH_COOLDOWN_FLAGGED   = 90 days;     // Elevated cooldown for bad actors
    uint256 constant BH_STAKE_PERCENT      = 10;          // Stake = 10% of potential reward
    uint256 constant FREEZE_LIGHT          = 180 days;    // LIGHT_FRAUD penalty: 6 months
    uint256 constant FREEZE_MILESTONE      = 365 days;    // MILESTONE_FRAUD penalty: 1 year
    uint256 constant FREEZE_HEAVY          = 730 days;    // HEAVY_FRAUD penalty: 2 years
    uint256 constant SCORE_MAX             = 1000;        // Maximum normalised screening score
    uint256 constant SCREENING_THRESHOLD   = 600;         // Minimum score to enter shortlist
    uint256 constant QUORUM_PERCENT        = 50;          // % of totalDonated that must vote
    uint256 constant CONFIDENCE_SLASH_PCT  = 50;          // % of confidence stake slashed on fraud
    uint256 constant CONFIDENCE_BONUS_PCT  = 20;          // % yield bonus on successful scholar
    uint256 constant MAX_COMMITTEE_MEMBERS = 15;          // Max committee size per program
    uint256 constant MAX_PUSH_REFUND_DONORS = 50;         // Push-refund guard; above this use claimRefund
}
