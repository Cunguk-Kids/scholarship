import { committeeGovernanceAbi, v4Addresses } from "@/constants/contractsV4";
import { useTxHook } from "./use-tx-base";

const COMMITTEE_ADDRESS = v4Addresses.CommitteeGovernance;

// ── CommitteeGovernance — Committee & Voting Actions ────────────────────────

export function useAddCommitteeMember() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const addMember = (programId: bigint, member: `0x${string}`) => {
    writeContract({
      address: COMMITTEE_ADDRESS,
      abi: committeeGovernanceAbi,
      functionName: "addCommitteeMember",
      args: [programId, member],
    });
  };

  return { addMember, isPending, isSuccess, error, hash, reset };
}

export function useRemoveCommitteeMember() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const removeMember = (programId: bigint, member: `0x${string}`) => {
    writeContract({
      address: COMMITTEE_ADDRESS,
      abi: committeeGovernanceAbi,
      functionName: "removeCommitteeMember",
      args: [programId, member],
    });
  };

  return { removeMember, isPending, isSuccess, error, hash, reset };
}

export function useCommitteeSubmitScore() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const submitScore = (args: {
    programId: bigint;
    applicant: `0x${string}`;
    academicScore: bigint;
    incomeScore: bigint;
    recommendScore: bigint;
  }) => {
    writeContract({
      address: COMMITTEE_ADDRESS,
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

  return { submitScore, isPending, isSuccess, error, hash, reset };
}

export function useVoteOnDispute() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const voteOnDispute = (
    disputeId: bigint,
    programId: bigint,
    upholdDispute: boolean
  ) => {
    writeContract({
      address: COMMITTEE_ADDRESS,
      abi: committeeGovernanceAbi,
      functionName: "voteOnDispute",
      args: [disputeId, programId, upholdDispute],
    });
  };

  return { voteOnDispute, isPending, isSuccess, error, hash, reset };
}

export function useVoteOnMilestone() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const voteOnMilestone = (
    milestoneId: bigint,
    programId: bigint,
    approve: boolean
  ) => {
    writeContract({
      address: COMMITTEE_ADDRESS,
      abi: committeeGovernanceAbi,
      functionName: "voteOnMilestone",
      args: [milestoneId, programId, approve],
    });
  };

  return { voteOnMilestone, isPending, isSuccess, error, hash, reset };
}
