import { mobius } from "@/services/gql/schema";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function useGetStudentProfile() {
  const account = useAccount();
  return useQuery({
    refetchOnMount: true,
    queryKey: ["students-profile", account.address],
    queryFn: async () => {
      const result = await mobius.query({
        studentss: {
          where: {
            where: {
              studentAddress: account.address,
            } as never,
          },
          select: {
            items: {
              id: true,
              blockchainId: true,
              createdAt: true,
              email: true,
              financialSituation: true,
              fullName: true,
              programId: true,
              scholarshipMotivation: true,
              studentAddress: true,
              updatedAt: true,
              program: {
                blockchainId: true,
                creator: true,
                name: true,
                milestoneType: true,
              },
              milestones: {
                select: {
                  items: {
                    amount: true,
                    blockchainId: true,
                    estimation: true,
                    description: true,
                    proveCID: true,
                    isCollected: true,
                    isApproved: true,
                  },
                },
              },
              votes: { select: { totalCount: true } as never },
            },
          },
        },
      });

      return result;
    },
    enabled: Boolean(account.address),
  });
}
