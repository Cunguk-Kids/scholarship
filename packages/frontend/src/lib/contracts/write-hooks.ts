import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import {
  scholarshipCoreAbi,
  scholarshipBountyAbi,
  scholarshipTreasuryAbi,
  milestoneManagerAbi,
  committeeGovernanceAbi,
  mockUSDCAbi,
  v4Addresses,
} from "@/constants/contractsV4";

// Contract address constants
const CORE_ADDRESS = v4Addresses.ScholarshipCore;
const BOUNTY_ADDRESS = v4Addresses.ScholarshipBounty;
const TREASURY_ADDRESS = v4Addresses.ScholarshipTreasury;
const MILESTONE_ADDRESS = v4Addresses.MilestoneManager;
const COMMITTEE_ADDRESS = v4Addresses.CommitteeGovernance;
const USDC_ADDRESS = v4Addresses.MockUSDC;

// ── Helpers ───────────────────────────────────────────────────────────────────
function useTxHook() {
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });
  return { hash, writeContract, isPending: isPending || isWaiting, isSuccess, error, reset };
}

// ── USDC ──────────────────────────────────────────────────────────────────────

export function useApproveUSDC() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const approve = (spender: `0x${string}`, amountStr: string) => {
    writeContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: mockUSDCAbi,
      functionName: "approve",
      args: [spender, parseUnits(amountStr, 6)],
    });
  };

  return { approve, isPending, isSuccess, error, hash };
}

export function useMintUSDC() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const mint = (to: `0x${string}`, amountStr: string) => {
    writeContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: mockUSDCAbi,
      functionName: "mint",
      args: [to, parseUnits(amountStr, 6)],
    });
  };

  return { mint, isPending, isSuccess, error, hash };
}

// ── ScholarshipCore — Program Lifecycle ───────────────────────────────────────

export function useCreateProgram() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const create = (args: {
    metadataCID: string;
    educationLevel: number;
    screeningMode: number;
    weights: {
      academicWeight: number;
      incomeWeight: number;
      essayWeight: number;
      recommendWeight: number;
      extracurricWeight: number;
    };
    slashDist: {
      bountyHunterPercent: number;
      treasuryPercent: number;
      protocolPercent: number;
    };
    maxCandidates: number;
    targetWinners: number;
    timeline: readonly [bigint, bigint, bigint, bigint];
    milestoneDisputeWindow: bigint;
    totalFund: string;
    maxOptionalMilestones: number;
    committeeContract: `0x${string}`;
  }) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "createProgram",
      args: [
        args.metadataCID,
        args.educationLevel,
        args.screeningMode,
        args.weights,
        args.slashDist,
        args.maxCandidates,
        args.targetWinners,
        args.timeline,
        args.milestoneDisputeWindow,
        parseUnits(args.totalFund, 6),
        args.maxOptionalMilestones,
        args.committeeContract,
      ],
    });
  };

  return { create, isPending, isSuccess, error, hash };
}

export function useOpenApplications() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const openApplications = (programId: bigint) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "openApplications",
      args: [programId],
    });
  };

  return { openApplications, isPending, isSuccess, error, hash };
}

export function useOpenScreening() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const openScreening = (programId: bigint) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "openScreening",
      args: [programId],
    });
  };

  return { openScreening, isPending, isSuccess, error, hash };
}

export function useCancelProgram() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const cancelProgram = (programId: bigint) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "cancelProgram",
      args: [programId],
    });
  };

  return { cancelProgram, isPending, isSuccess, error, hash };
}

export function useResolveShortlist() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const resolveShortlist = (programId: bigint, ranked: `0x${string}`[]) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "resolveShortlist",
      args: [programId, ranked],
    });
  };

  return { resolveShortlist, isPending, isSuccess, error, hash };
}

export function useSelectWinners() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const selectWinners = (
    programId: bigint,
    ranked: `0x${string}`[],
    amounts: bigint[][],
    descs: string[][]
  ) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "selectWinners",
      args: [programId, ranked, amounts, descs],
    });
  };

  return { selectWinners, isPending, isSuccess, error, hash };
}

// ── Donations ─────────────────────────────────────────────────────────────────

export function useDonate() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const donate = (programId: bigint, amountStr: string, nftMetadataURI: string) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "donate",
      args: [programId, parseUnits(amountStr, 6), nftMetadataURI],
    });
  };

  return { donate, isPending, isSuccess, error, hash };
}

// ── Applications & Screening ──────────────────────────────────────────────────

export function useApplyProgram() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const apply = (args: {
    programId: bigint;
    profileCID: string;
    documentCID: string;
    essayCID: string;
    recommendCID: string;
    academicScore: bigint;
    incomeScore: bigint;
    recommendScore: bigint;
  }) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "applyToProgram",
      args: [
        args.programId,
        args.profileCID,
        args.documentCID,
        args.essayCID,
        args.recommendCID,
        args.academicScore,
        args.incomeScore,
        args.recommendScore,
      ],
    });
  };

  return { apply, isPending, isSuccess, error, hash };
}

export function useSubmitScore() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const submitScore = (args: {
    programId: bigint;
    applicant: `0x${string}`;
    academicScore: bigint;
    incomeScore: bigint;
    recommendScore: bigint;
    committeeAddress: `0x${string}`;
  }) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "submitCommitteeScore",
      args: [
        args.programId,
        args.applicant,
        args.academicScore,
        args.incomeScore,
        args.recommendScore,
        args.committeeAddress,
      ],
    });
  };

  return { submitScore, isPending, isSuccess, error, hash };
}

// ── Voting ────────────────────────────────────────────────────────────────────

export function useCastVote() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const castVote = (programId: bigint, candidate: `0x${string}`) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "voteForCandidate",
      args: [programId, candidate],
    });
  };

  return { castVote, isPending, isSuccess, error, hash };
}

export function useStakeConfidence() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const stake = (programId: bigint, scholar: `0x${string}`, amountStr: string) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "placeConfidenceStake",
      args: [programId, scholar, parseUnits(amountStr, 6)],
    });
  };

  return { stake, isPending, isSuccess, error, hash };
}

// ── MilestoneManager — Scholar Actions ───────────────────────────────────────

/**
 * FIX: was calling `submitMilestoneProof` on Core — correct is `submitProof` on MilestoneManager.
 */
export function useSubmitMilestone() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const submitMilestone = (milestoneId: bigint, proofCID: string) => {
    writeContract({
      address: MILESTONE_ADDRESS as `0x${string}`,
      abi: milestoneManagerAbi,
      functionName: "submitProof",
      args: [milestoneId, proofCID],
    });
  };

  return { submitMilestone, isPending, isSuccess, error, hash };
}

export function useExecuteMilestone() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const executeMilestone = (milestoneId: bigint) => {
    writeContract({
      address: MILESTONE_ADDRESS as `0x${string}`,
      abi: milestoneManagerAbi,
      functionName: "executeMilestone",
      args: [milestoneId],
    });
  };

  return { executeMilestone, isPending, isSuccess, error, hash };
}

export function useProposeMilestone() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  /**
   * @param kind 1 = OPTIONAL, 2 = NEGOTIATED (0 = MANDATORY — not allowed here)
   */
  const proposeMilestone = (
    programId: bigint,
    kind: number,
    amount: bigint,
    descriptionCID: string
  ) => {
    writeContract({
      address: MILESTONE_ADDRESS as `0x${string}`,
      abi: milestoneManagerAbi,
      functionName: "proposeMilestone",
      args: [programId, kind, amount, descriptionCID],
    });
  };

  return { proposeMilestone, isPending, isSuccess, error, hash };
}

// ── ScholarshipBounty ─────────────────────────────────────────────────────────

export function useRaiseDispute() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const raiseDispute = (
    programId: bigint,
    scholar: `0x${string}`,
    disputeType: number,
    milestoneId: bigint,
    evidenceCID: string
  ) => {
    writeContract({
      address: BOUNTY_ADDRESS as `0x${string}`,
      abi: scholarshipBountyAbi,
      functionName: "raiseDispute",
      args: [programId, scholar, milestoneId, disputeType, evidenceCID],
    });
  };

  return { raiseDispute, isPending, isSuccess, error, hash };
}

export function useDefendDispute() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const submitDefense = (disputeId: bigint, evidenceCID: string) => {
    writeContract({
      address: BOUNTY_ADDRESS as `0x${string}`,
      abi: scholarshipBountyAbi,
      functionName: "submitCounterEvidence",
      args: [disputeId, evidenceCID],
    });
  };

  return { submitDefense, isPending, isSuccess, error, hash };
}

export function useConcedeDispute() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const concede = (disputeId: bigint) => {
    writeContract({
      address: BOUNTY_ADDRESS as `0x${string}`,
      abi: scholarshipBountyAbi,
      functionName: "concede",
      args: [disputeId],
    });
  };

  return { concede, isPending, isSuccess, error, hash };
}

export function useTriggerAutoGuilty() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const triggerAutoGuilty = (disputeId: bigint) => {
    writeContract({
      address: BOUNTY_ADDRESS as `0x${string}`,
      abi: scholarshipBountyAbi,
      functionName: "triggerAutoGuilty",
      args: [disputeId],
    });
  };

  return { triggerAutoGuilty, isPending, isSuccess, error, hash };
}

// ── ScholarshipTreasury ───────────────────────────────────────────────────────

export function useClaimYield() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const claimYield = (programId: bigint, voteAddress: `0x${string}`) => {
    writeContract({
      address: TREASURY_ADDRESS as `0x${string}`,
      abi: scholarshipTreasuryAbi,
      functionName: "claimYield",
      args: [programId, voteAddress],
    });
  };

  return { claimYield, isPending, isSuccess, error, hash };
}

// ── CommitteeGovernance ───────────────────────────────────────────────────────

export function useAddCommitteeMember() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const addMember = (programId: bigint, member: `0x${string}`) => {
    writeContract({
      address: COMMITTEE_ADDRESS as `0x${string}`,
      abi: committeeGovernanceAbi,
      functionName: "addCommitteeMember",
      args: [programId, member],
    });
  };

  return { addMember, isPending, isSuccess, error, hash };
}

export function useRemoveCommitteeMember() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const removeMember = (programId: bigint, member: `0x${string}`) => {
    writeContract({
      address: COMMITTEE_ADDRESS as `0x${string}`,
      abi: committeeGovernanceAbi,
      functionName: "removeCommitteeMember",
      args: [programId, member],
    });
  };

  return { removeMember, isPending, isSuccess, error, hash };
}

export function useCommitteeSubmitScore() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const submitScore = (args: {
    programId: bigint;
    applicant: `0x${string}`;
    academicScore: bigint;
    incomeScore: bigint;
    recommendScore: bigint;
  }) => {
    writeContract({
      address: COMMITTEE_ADDRESS as `0x${string}`,
      abi: committeeGovernanceAbi,
      functionName: "submitScore",
      args: [
        args.programId,
        args.applicant,
        args.academicScore,
        args.incomeScore,
        args.recommendScore,
      ],
    });
  };

  return { submitScore, isPending, isSuccess, error, hash };
}

export function useVoteOnDispute() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const voteOnDispute = (
    disputeId: bigint,
    programId: bigint,
    upholdDispute: boolean
  ) => {
    writeContract({
      address: COMMITTEE_ADDRESS as `0x${string}`,
      abi: committeeGovernanceAbi,
      functionName: "voteOnDispute",
      args: [disputeId, programId, upholdDispute],
    });
  };

  return { voteOnDispute, isPending, isSuccess, error, hash };
}

export function useVoteOnMilestone() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const voteOnMilestone = (
    milestoneId: bigint,
    programId: bigint,
    approve: boolean
  ) => {
    writeContract({
      address: COMMITTEE_ADDRESS as `0x${string}`,
      abi: committeeGovernanceAbi,
      functionName: "voteOnMilestone",
      args: [milestoneId, programId, approve],
    });
  };

  return { voteOnMilestone, isPending, isSuccess, error, hash };
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin & Timeline Write Hooks (Phase D)
// ─────────────────────────────────────────────────────────────────────────────

export function useExtendApplicationDeadline() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const extendApplicationDeadline = (programId: bigint, newEnd: bigint) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "extendApplicationDeadline",
      args: [programId, newEnd],
    });
  };

  return { extendApplicationDeadline, isPending, isSuccess, error, hash };
}

export function useExtendVotingDeadline() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const extendVotingDeadline = (programId: bigint, newEnd: bigint) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "extendVotingDeadline",
      args: [programId, newEnd],
    });
  };

  return { extendVotingDeadline, isPending, isSuccess, error, hash };
}

export function useAdminForceStatus() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const adminForceStatus = (programId: bigint, newStatus: number) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "adminForceStatus",
      args: [programId, newStatus],
    });
  };

  return { adminForceStatus, isPending, isSuccess, error, hash };
}

export function useAdminUpdateDates() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const adminUpdateDates = (
    programId: bigint,
    appStart: bigint,
    appEnd: bigint,
    voteStart: bigint,
    voteEnd: bigint
  ) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "adminUpdateDates",
      args: [programId, appStart, appEnd, voteStart, voteEnd],
    });
  };

  return { adminUpdateDates, isPending, isSuccess, error, hash };
}

export function useUpdateProtocolConfig() {
  const { writeContract, isPending, isSuccess, error, hash } = useTxHook();

  const updateProtocolConfig = (newConfig: any) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "setProtocolConfig",
      args: [newConfig],
    });
  };

  return { updateProtocolConfig, isPending, isSuccess, error, hash };
}
