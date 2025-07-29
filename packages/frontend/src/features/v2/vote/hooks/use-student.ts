import { mobius } from "@/services/gql/schema";
import { useQuery } from "@tanstack/react-query";

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const result = await mobius.query({
        studentss: {
          select: {
            items: {
              createdAt: true,
              email: true,
              financialSituation: true,
              fullName: true,
              id: true,
              programId: true,
              scholarshipMotivation: true,
              studentAddress: true,
              updatedAt: true,
              milestones: {
                select: {
                  items: {
                    amount: true,
                    blockchainId: true,
                    estimation: true,
                    description: true,
                  }
                }
              }
            },
          },
        },
      });

      return result;
    },
  });
}
