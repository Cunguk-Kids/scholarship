import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { scholarshipCoreAbi, scholarshipBountyAbi, scholarshipTreasuryAbi, mockUSDCAbi, v4Addresses } from "@/constants/contractsV4";

// for now we use the v4Addresses object which will be populated dynamically or via env)
const CORE_ADDRESS = v4Addresses.ScholarshipCore;
const BOUNTY_ADDRESS = v4Addresses.ScholarshipBounty;
const TREASURY_ADDRESS = v4Addresses.ScholarshipTreasury;
const USDC_ADDRESS = v4Addresses.MockUSDC;

// ── USDC Approvals ────────────────────────────────────────────────────────

export function useApproveUSDC() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (spender: `0x${string}`, amountStr: string) => {
    writeContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: mockUSDCAbi,
      functionName: "approve",
      args: [spender, parseUnits(amountStr, 6)],
    });
  };

  return { approve, isPending: isPending || isWaiting, isSuccess, error, hash };
}

// ── Scholarship Core ──────────────────────────────────────────────────────

export function useCreateProgram() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const create = (args: {
    metadataCID: string;
    educationLevel: number;
    screeningMode: number;
    weights: { academicWeight: number; incomeWeight: number; essayWeight: number; recommendWeight: number; extracurricWeight: number; };
    slashDist: { bountyHunterPercent: number; treasuryPercent: number; protocolPercent: number; };
    maxCandidates: number;
    targetWinners: number;
    timeline: readonly [bigint, bigint, bigint, bigint];
    milestoneDisputeWindow: bigint;
    totalFund: string;
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
        args.committeeContract,
      ],
    });
  };

  return { create, isPending: isPending || isWaiting, isSuccess, error, hash };
}

export function useDonate() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const donate = (programId: bigint, amountStr: string, nftMetadataURI: string) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "donate",
      args: [programId, parseUnits(amountStr, 6), nftMetadataURI],
    });
  };

  return { donate, isPending: isPending || isWaiting, isSuccess, error, hash };
}

export function useApplyProgram() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const apply = (args: {
    programId: bigint;
    profileCID: string;
    documentCID: string;
    essayCID: string;
    recommendCID: string;
    selfDeclaredAcademicScore: bigint;
    selfDeclaredIncomeScore: bigint;
    selfDeclaredRecommendScore: bigint;
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
        args.selfDeclaredAcademicScore,
        args.selfDeclaredIncomeScore,
        args.selfDeclaredRecommendScore,
      ],
    });
  };

  return { apply, isPending: isPending || isWaiting, isSuccess, error, hash };
}

export function useSubmitScore() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

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
      args: [args.programId, args.applicant, args.academicScore, args.incomeScore, args.recommendScore, args.committeeAddress],
    });
  };

  return { submitScore, isPending: isPending || isWaiting, isSuccess, error, hash };
}

export function useCastVote() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const castVote = (programId: bigint, candidate: `0x${string}`) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "voteForCandidate",
      args: [programId, candidate],
    });
  };

  return { castVote, isPending: isPending || isWaiting, isSuccess, error, hash };
}

export function useStakeConfidence() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (programId: bigint, scholar: `0x${string}`, amountStr: string) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "placeConfidenceStake",
      args: [programId, scholar, parseUnits(amountStr, 6)],
    });
  };

  return { stake, isPending: isPending || isWaiting, isSuccess, error, hash };
}

export function useSubmitMilestone() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submitMilestone = (milestoneId: bigint, proofCID: string) => {
    writeContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi: scholarshipCoreAbi,
      functionName: "submitMilestoneProof",
      args: [milestoneId, proofCID],
    });
  };

  return { submitMilestone, isPending: isPending || isWaiting, isSuccess, error, hash };
}

// ── Scholarship Bounty ────────────────────────────────────────────────────

export function useRaiseDispute() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const raiseDispute = (programId: bigint, scholar: `0x${string}`, disputeType: number, milestoneId: bigint, evidenceCID: string) => {
    writeContract({
      address: BOUNTY_ADDRESS as `0x${string}`,
      abi: scholarshipBountyAbi,
      functionName: "raiseDispute",
      args: [programId, scholar, milestoneId, disputeType, evidenceCID],
    });
  };

  return { raiseDispute, isPending: isPending || isWaiting, isSuccess, error, hash };
}

export function useDefendDispute() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submitDefense = (disputeId: bigint, evidenceCID: string) => {
    writeContract({
      address: BOUNTY_ADDRESS as `0x${string}`,
      abi: scholarshipBountyAbi,
      functionName: "submitCounterEvidence",
      args: [disputeId, evidenceCID as `0x${string}`],
    });
  };

  return { submitDefense, isPending: isPending || isWaiting, isSuccess, error, hash };
}

export function useConcedeDispute() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const concede = (disputeId: bigint) => {
    writeContract({
      address: BOUNTY_ADDRESS as `0x${string}`,
      abi: scholarshipBountyAbi,
      functionName: "concede",
      args: [disputeId],
    });
  };

  return { concede, isPending: isPending || isWaiting, isSuccess, error, hash };
}

// ── Scholarship Treasury ──────────────────────────────────────────────────

export function useClaimYield() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimYield = (programId: bigint) => {
    writeContract({
      address: TREASURY_ADDRESS as `0x${string}`,
      abi: scholarshipTreasuryAbi,
      functionName: "claimDonorYield",
      args: [programId],
    });
  };

  return { claimYield, isPending: isPending || isWaiting, isSuccess, error, hash };
}
