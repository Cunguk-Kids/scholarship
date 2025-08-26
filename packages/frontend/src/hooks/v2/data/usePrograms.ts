import { mobius } from "@/services/gql/schema";
import { toNullable } from "@/util/toNullData";
import { useQuery } from "@tanstack/react-query";

type Filter = { id?: string; name?: string };

export type ProgramResultDto = NonNullable<
  ReturnType<typeof useProgramsV2>["data"]
>[0];

export function useProgramsV2(filter?: Filter) {
  return useQuery({
    queryKey: ["programs", filter],
    queryFn: async () => {
      const result = await mobius.query({
        programss: {
          where: {
            where: toNullable(filter) as any,
          },
          select: {
            items: {
              id: true,
              name: true,
              description: true,
              blockchainId: true,
              creator: true,
              endAt: true,
              startAt: true,
              votingAt: true,
              ongoingAt: true,
              totalRecipients: true,
              totalFund: true,
              milestoneType: true,
              milestonesProgram: true,
            },
          },
        },
      });
      return result?.programss.items;
    },
  });
}
