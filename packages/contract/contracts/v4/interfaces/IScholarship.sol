// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ScholarshipTypes} from "../libraries/ScholarshipTypes.sol";

// ═══════════════════════════════════════════════════════════════════════
// IScholarshipCore
// ═══════════════════════════════════════════════════════════════════════

/**
 * @notice Minimal surface exposed by ScholarshipCore to sibling contracts.
 *         Bounded to read-queries and privileged state mutations that only
 *         ScholarshipBounty or CommitteeGovernance may invoke.
 */
interface IScholarshipCore {
    // ── Queries ────────────────────────────────────────────────────────

    function getProgram(uint256 programId)
        external view returns (ScholarshipTypes.Program memory);

    function getScholar(address wallet, uint256 programId)
        external view returns (ScholarshipTypes.Scholar memory);

    function getMilestone(uint256 milestoneId)
        external view returns (ScholarshipTypes.Milestone memory);

    /// @notice Check whether a student wallet is currently eligible to apply.
    function isStudentEligible(address wallet)
        external view returns (bool eligible, string memory reason);

    /// @notice USDC value of undisbursed milestones for a given scholar.
    function getRemainingFund(address wallet, uint256 programId)
        external view returns (uint256);

    // ── Privilege mutations (BOUNTY_ROLE) ──────────────────────────────

    /// @notice Freeze a milestone so it cannot be auto-released.
    function freezeMilestone(uint256 milestoneId) external;

    /// @notice Unfreeze a milestone (BH lost) — restart dispute window.
    function releaseMilestone(uint256 milestoneId) external;

    /**
     * @notice Apply fraud penalty to a scholar.
     *         Sets global freeze / blacklist and punishes voters.
     */
    function slashScholar(
        address wallet,
        uint256 programId,
        ScholarshipTypes.DisputeType disputeType
    ) external;
}

// ═══════════════════════════════════════════════════════════════════════
// IScholarshipTreasury
// ═══════════════════════════════════════════════════════════════════════

/**
 * @notice Interface for all fund movements in the protocol.
 *         ScholarshipCore and ScholarshipBounty call these; users never
 *         interact with the treasury directly.
 */
interface IScholarshipTreasury {

    // ── Program fund management ────────────────────────────────────────

    /// @notice Register a new program deposit (called by Core on creation).
    function depositProgramFund(uint256 programId, uint256 amount) external;

    /// @notice Record a donor contribution for yield/refund accounting.
    function recordDonation(uint256 programId, address donor, uint256 netAmount) external;

    // ── Milestone disbursement ─────────────────────────────────────────

    /// @notice Release milestone payment to scholar after dispute window clears.
    function disburseMilestone(
        address scholar,
        uint256 programId,
        uint256 milestoneId,
        uint256 amount
    ) external;

    // ── Slash distribution ─────────────────────────────────────────────

    /**
     * @notice Distribute a slashed scholar's remaining program balance.
     * @return bhReward Amount transferred to the bounty hunter.
     */
    function slashAndDistribute(
        uint256 programId,
        address scholar,
        address bountyHunter,
        uint256 bhPercent,
        uint256 treasuryPercent,
        uint256 protocolPercent
    ) external returns (uint256 bhReward);

    // ── Confidence stake ───────────────────────────────────────────────

    function depositConfidenceStake(
        uint256 programId,
        address voter,
        address scholar,
        uint256 amount
    ) external;

    function resolveConfidenceStake(
        uint256 programId,
        address voter,
        bool scholarSucceeded
    ) external;

    // ── Yield ──────────────────────────────────────────────────────────

    function addYield(uint256 programId, uint256 amount) external;

    function distributeYield(uint256 programId) external;

    // ── Refunds ────────────────────────────────────────────────────────

    function refundDonors(uint256 programId) external;

    // ── Views ──────────────────────────────────────────────────────────

    function getProgramBalance(uint256 programId) external view returns (uint256);

    function getAccruedYield(uint256 programId) external view returns (uint256);

    function getProgramDonors(uint256 programId) external view returns (address[] memory);
}

// ═══════════════════════════════════════════════════════════════════════
// IScholarshipBounty
// ═══════════════════════════════════════════════════════════════════════

/**
 * @notice External surface of the bounty / dispute contract.
 *         CommitteeGovernance reads dispute data and triggers resolution.
 */
interface IScholarshipBounty {
    function getDispute(uint256 disputeId)
        external view returns (ScholarshipTypes.Dispute memory);

    /**
     * @notice Committee calls this once majority is reached.
     * @param bountyHunterWon true = scholar guilty; false = BH rejected.
     */
    function resolveDispute(uint256 disputeId, bool bountyHunterWon) external;
}

// ═══════════════════════════════════════════════════════════════════════
// IScholarshipReputation
// ═══════════════════════════════════════════════════════════════════════

/**
 * @notice Interface for the non-transferable REP Soulbound Token.
 *         All mutations must include a human-readable reason for auditability.
 */
interface IScholarshipReputation {
    function mint(address to,   uint256 amount, string calldata reason) external;
    function burn(address from, uint256 amount, string calldata reason) external;
    function balanceOf(address account) external view returns (uint256);
    function lockVotingPower(address voter, uint256 lockUntil)          external;
    function isVotingPowerLocked(address voter) external view returns (bool);
}

// ═══════════════════════════════════════════════════════════════════════
// ICommitteeGovernance
// ═══════════════════════════════════════════════════════════════════════

/**
 * @notice Minimal surface exposed by CommitteeGovernance to ScholarshipCore.
 */
interface ICommitteeGovernance {
    function isCommitteeMember(uint256 programId, address member)
        external view returns (bool);
}
