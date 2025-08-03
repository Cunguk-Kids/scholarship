import { mobius } from "@/services/gql/schema";
import { useQuery } from "@tanstack/react-query";

export function useStudents(programId: string) {
  return useQuery({
    queryKey: ["students", programId],
    queryFn: async () => {
      const result = await mobius.query({
        studentss: {
          where: {
            where: { programId } as never
          },
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
                  },
                },
              },
            },
          },
        },
      });

      return result;
    },
  });
}
