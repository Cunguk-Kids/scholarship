import { api } from "@/repo/api";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";

export function useGetMilestones(
  programId: bigint,
  appBatch: bigint,
  applicantId: bigint
) {
  const data = useQuery({
    queryKey: ["milestones", programId, appBatch, applicantId],
    queryFn: async () => {
      const result = await api.v1.applicant
        .milestones({ id: `${programId}_${appBatch}_${applicantId}` })
        .get();

      if (result.error) throw result.error;

      return result.data;
    },
  });

  return data;
}

export function useGetMilestonesAddress(address: Address) {
  const data = useQuery({
    queryKey: ["milestones-addr", address],
    queryFn: async () => {
      const result = await api.v1.applicant.milestones
        .address({ address: address })
        .get();

      if (result.error) throw result.error;

      return result.data;
    },
  });

  return data;
}
