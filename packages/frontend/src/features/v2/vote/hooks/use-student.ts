import { mobius } from "@/services/gql/schema";
import { toNullable } from "@/util/toNullData";
import { useQuery } from "@tanstack/react-query";

type Filter = { id?: string; name?: string; programId?: string; };


export function useStudents(filter: Filter) {
  console.log(toNullable(filter), '----toNullable(filter)----');

  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const result = await mobius.query({
        studentss: {
          where: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            where: toNullable(filter) as any,
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
