import useSWR from "swr";
import { mobius } from "@/services/gql/schema";
import { toNullable } from "@/util/toNullData";
import type { Filter } from "viem";
import { useProgramsVoteWatcher } from "./useWatchEvent";

export type VoteFilter = {
  id?: string;
  voter?: string;
  proposalId?: string;
};
type SWRKey = [string, Filter?];

export function useVotes(initialFilter?: VoteFilter) {
  useProgramsVoteWatcher();

  const fetcher = async (_: string, filter?: VoteFilter) => {
    const result = await mobius.query({
      votess: {
        where: {
          where: toNullable(filter),
        },
        select: {
          items: {
            id: true,
            name: true,
          },
        },
      },
    });
    return result?.votess.items;
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    ["votes", initialFilter],
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const refetch = async (newFilter?: Filter) => {
    const key: SWRKey = ["votes", newFilter];
    return mutate(() => fetcher(key[0], key[1]), { revalidate: true });
  };

  return {
    data,
    error,
    loading: isLoading,
    validating: isValidating,
    refetch: refetch
  };
}
