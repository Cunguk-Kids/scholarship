import useSWR from "swr";
import { mobius } from "@/gql/schema";
import { useProgramsEventWatcher } from "./useWatchEvent";
import { toNullable } from "@/util/toNullData";

type Filter = { id?: string; name?: string; };
type SWRKey = [string, Filter?];

export function usePrograms(initialFilter?: Filter) {
  useProgramsEventWatcher();

  const fetcher = async (_key: string, filter?: Filter) => {
    const result = await mobius.query({
      programss: {
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
    return result?.programss.items;
  };

  const swrKey = ["programs", initialFilter];

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const refetch = async (newFilter?: Filter) => {
    const key: SWRKey = ["programs", newFilter];
    return mutate(() => fetcher(key[0], key[1]), { revalidate: true });
  };
  return {
    data,
    error,
    loading: isLoading,
    validating: isValidating,
    refetch,
  };
}
