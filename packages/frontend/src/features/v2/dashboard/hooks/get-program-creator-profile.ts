import { mobius } from "@/services/gql/schema";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function useGetProgramCreatorProfile() {
  const account = useAccount();
  return useQuery({
    refetchOnMount: true,
    queryKey: ["program-creator-profile", account.address],
    queryFn: async () => {
      const result = await mobius.query({
        programss: {
          where: {
            where: {
              creator: account.address,
            } as never,
          },
          select: {
            items: {
              name: true,
              description: true,
              totalRecipients: true,
              blockchainId: true,
              totalFund: true,
              rules: true,
              milestones: {
                select: {
                  items: {
                    isApproved: true,
                    isCollected: true,
                    blockchainId: true,
                    proveCID: true,
                    student: {
                      id: true,
                      fullName: true,
                      email: true,
                      studentAddress: true,
                      votes: {
                        select: {
                          totalCount: true,
                        },
                      },
                    },
                    description: true,
                    amount: true,
                  },
                },
              },
              milestoneType: true,
            },
          },
        },
      });

      return result;
    },
    enabled: Boolean(account.address),
  });
}
