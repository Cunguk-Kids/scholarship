import { api } from "@/repo/api";
import { useQuery } from "@tanstack/react-query";

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
