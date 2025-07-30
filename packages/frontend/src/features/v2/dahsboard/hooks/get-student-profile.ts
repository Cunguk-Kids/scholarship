import { mobius } from "@/services/gql/schema";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function useGetStudentProfile() {
  const account = useAccount();
  return useQuery({
    refetchOnMount: true,
    queryKey: ["students"],
    queryFn: async () => {
      const result = await mobius.query({
        studentss: {
          where: {
            where: {
              studentAddress: "0x73F98364f6B62a5683F2C14ae86a23D7288f6106",
            } as unknown as {
              id: null;
              name: null;
              programId: null;
              studentAddress: null;
            },
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
              program: {
                creator: true,
                name: true,
              },
              milestones: {
                select: {
                  items: {
                    amount: true,
                    blockchainId: true,
                    estimation: true,
                    description: true,
                    proveCID: true,
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
