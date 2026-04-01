import { createConfig } from "ponder";
import dotenv from "dotenv";

import { scholarshipCoreAbi }        from "./abis/v4/ScholarshipCore";
import { scholarshipTreasuryAbi }    from "./abis/v4/ScholarshipTreasury";
import { scholarshipBountyAbi }      from "./abis/v4/ScholarshipBounty";
import { scholarshipReputationAbi }  from "./abis/v4/ScholarshipReputation";
import { committeeGovernanceAbi }    from "./abis/v4/CommitteeGovernance";

dotenv.config();

/**
 * Ponder v4 Configuration
 *
 * Indexes 5 separate v4 contracts:
 *   - ScholarshipCore      → program lifecycle + voting
 *   - ScholarshipTreasury  → donations, milestones, yield
 *   - ScholarshipBounty    → disputes, BH records
 *   - ScholarshipReputation → REP mint/burn
 *   - CommitteeGovernance  → scoring, dispute votes
 *
 * Contract addresses are read from .env so the same config
 * works for localhost and liskSepolia without code changes.
 *
 * Required .env keys:
 *   PONDER_RPC_URL_LISK
 *   CONTRACT_CORE
 *   CONTRACT_TREASURY
 *   CONTRACT_BOUNTY
 *   CONTRACT_REPUTATION
 *   CONTRACT_COMMITTEE
 *   START_BLOCK            (first block after deployment)
 */

const startBlock = Number(process.env.START_BLOCK ?? 0);

export default createConfig({
  chains: {
    lisk: {
      id: 4202,
      rpc: process.env.PONDER_RPC_URL_LISK!,
    },
  },

  contracts: {
    // ── ScholarshipCore ───────────────────────────────────────────────
    // Emits: ProgramCreated, ProgramStatusChanged, DonationReceived,
    //        StudentApplied, ScoreSubmitted, StudentShortlisted,
    //        VoteCast, ConfidenceStaked, ScholarSelected,
    //        MilestoneSubmitted, MilestoneCompleted, MilestoneFrozen,
    //        MilestoneReleased, ScholarSlashed, ScholarCompleted,
    //        ProgramCompleted, ProgramCancelled
    ScholarshipCore: {
      chain: "lisk",
      abi: scholarshipCoreAbi,
      address: process.env.CONTRACT_CORE! as `0x${string}`,
      startBlock,
    },

    // ── ScholarshipTreasury ────────────────────────────────────────────
    // Emits: FundDeposited, DonationRecorded, MilestoneDisbursed,
    //        SlashDistributed, ConfidenceStakeDeposited,
    //        ConfidenceStakeResolved, YieldAdded, YieldDistributed,
    //        YieldClaimed, DonorRefunded
    ScholarshipTreasury: {
      chain: "lisk",
      abi: scholarshipTreasuryAbi,
      address: process.env.CONTRACT_TREASURY! as `0x${string}`,
      startBlock,
    },

    // ── ScholarshipBounty ─────────────────────────────────────────────
    // Emits: DisputeRaised, StudentDefended, StudentConceded,
    //        DisputeAutoGuilty, DisputeResolved, BHFlagged
    ScholarshipBounty: {
      chain: "lisk",
      abi: scholarshipBountyAbi,
      address: process.env.CONTRACT_BOUNTY! as `0x${string}`,
      startBlock,
    },

    // ── ScholarshipReputation ─────────────────────────────────────────
    // Emits: ReputationMinted, ReputationBurned, VotingPowerLocked
    ScholarshipReputation: {
      chain: "lisk",
      abi: scholarshipReputationAbi,
      address: process.env.CONTRACT_REPUTATION! as `0x${string}`,
      startBlock,
    },

    // ── CommitteeGovernance ───────────────────────────────────────────
    // Emits: CommitteeMemberAdded, CommitteeMemberRemoved,
    //        MemberScoreSubmitted, TiebreakerRequired, ScoreFinalized,
    //        DisputeVoteCast, DisputeResolutionReached
    CommitteeGovernance: {
      chain: "lisk",
      abi: committeeGovernanceAbi,
      address: process.env.CONTRACT_COMMITTEE! as `0x${string}`,
      startBlock,
    },
  },
});
