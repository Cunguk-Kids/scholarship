/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR from "swr";
import { mobius } from "@/services/gql/schema";
import { toNullable } from "@/util/toNullData";
import type { Filter } from "viem";

export type MilestoneFilter = {
  id?: string;
  title?: string;
};
type SWRKey = [string, Filter?];

export function useMilestones(initialFilter?: MilestoneFilter) {
  const fetcher = async (_: string, filter?: MilestoneFilter) => {
    const result = await mobius.query({
      milestoness: {
        where: {
          where: toNullable(filter) as any,
        },
        select: {
          items: {
            id: true,
            name: true,
          },
        },
      },
    });
    return result?.milestoness.items;
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    ["milestones", initialFilter],
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const refetch = async (newFilter?: Filter) => {
    const key: SWRKey = ["milestones", newFilter];
    return mutate(() => fetcher(key[0], key[1]), { revalidate: true });
  };

  return {
    data,
    error,
    loading: isLoading,
    validating: isValidating,
    refetch
  };
}
