import { scholarshipAdminAbi, v4Addresses } from "@/constants/contractsV4";
import { useTxHook } from "./use-tx-base";

const ADMIN_ADDRESS = v4Addresses.ScholarshipAdmin;

// ── ScholarshipAdmin — Protocol & Lifecycle Date Management ─────────────────

export function useExtendApplicationDeadline() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const extendApplicationDeadline = (programId: bigint, newEnd: bigint) => {
    writeContract({
      address: ADMIN_ADDRESS,
      abi: scholarshipAdminAbi,
      functionName: "extendApplicationDeadline",
      args: [programId, newEnd],
    });
  };

  return { extendApplicationDeadline, isPending, isSuccess, error, hash, reset };
}

export function useExtendVotingDeadline() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const extendVotingDeadline = (programId: bigint, newEnd: bigint) => {
    writeContract({
      address: ADMIN_ADDRESS,
      abi: scholarshipAdminAbi,
      functionName: "extendVotingDeadline",
      args: [programId, newEnd],
    });
  };

  return { extendVotingDeadline, isPending, isSuccess, error, hash, reset };
}


export function useUpdateProtocolConfig() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const updateProtocolConfig = (config: any) => {
    writeContract({
      address: ADMIN_ADDRESS,
      abi: scholarshipAdminAbi,
      functionName: "setProtocolConfig",
      args: [config],
    });
  };

  return { updateProtocolConfig, isPending, isSuccess, error, hash, reset };
}

export function useAdminForceStatus() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const forceStatus = (programId: bigint, newStatus: number) => {
    writeContract({
      address: ADMIN_ADDRESS,
      abi: scholarshipAdminAbi,
      functionName: "adminForceStatus",
      args: [programId, newStatus],
    });
  };

  return { forceStatus, isPending, isSuccess, error, hash, reset };
}

export function useAdminUpdateDates() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const updateDates = (
    programId: bigint,
    appStart: bigint,
    appEnd: bigint,
    voteStart: bigint,
    voteEnd: bigint
  ) => {
    writeContract({
      address: ADMIN_ADDRESS,
      abi: scholarshipAdminAbi,
      functionName: "adminUpdateDates",
      args: [programId, appStart, appEnd, voteStart, voteEnd],
    });
  };

  return { updateDates, isPending, isSuccess, error, hash, reset };
}
