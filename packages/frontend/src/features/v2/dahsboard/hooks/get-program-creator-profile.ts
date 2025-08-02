import { mobius } from "@/services/gql/schema";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function useGetProgramCreatorProfile() {
  const account = useAccount();
  return useQuery({
    refetchOnMount: true,
    queryKey: ["program-creator-profile"],
    queryFn: async () => {
      const result = await mobius.query({
        programss: {
          where: {
            where: {
              creator: account.address,
            } as unknown as {
              id: null;
              name: null;
              creator: string;
            },
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
                    blockchainId: true,
                    proveCID: true,
                    student: {
                      fullName: true,
                      email: true,
                      studentAddress: true,
                    },
                    description: true,
                    amount: true,
                  },
                },
              },
            },
          },
        },
      });

      return result;
    },
    enabled: Boolean(account.address),
  });
}
