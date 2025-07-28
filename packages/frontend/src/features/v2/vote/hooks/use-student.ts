import { mobius } from "@/services/gql/schema";
import { useQuery } from "@tanstack/react-query";

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const result = await mobius.query({
        milestoness: {
          select: {
            items: {
              amount: true,
              milestoneId: true,
              createdAt: true,
              description: true,
              estimation: true,
              id: true,
              isCollected: true,
              metadataCID: true,
              programId: true,
              proveCID: true,
              studentId: true,
              type: true,
              updatedAt: true,
            },
          },
        },
        studentss: {
          select: {
            items: {
              createdAt: true,
              email: true,
              financialSituation: true,
              fullName: true,
              id: true,
              studentId: true,
              programId: true,
              scholarshipMotivation: true,
              studentAddress: true,
              updatedAt: true,
            },
          },
        },
      });

      return result;
    },
  });
}
