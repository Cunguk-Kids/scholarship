import useSWR from "swr";
import { mobius } from "@/services/gql/schema";
import { toNullable } from "@/util/toNullData";
import { useProgramsStudentWatcher } from "./useWatchEvent";

type Filter = { id?: string; name?: string; };
type SWRKey = [string, Filter?];

export function useStudents(initialFilter?: Filter) {
  useProgramsStudentWatcher();

  const fetcher = async (_key: string, filter?: Filter) => {
    const result = await mobius.query({
      studentss: {
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
    return result?.studentss.items;
  };

  const swrKey: SWRKey = ["students", initialFilter];

  const { data, error, isLoading, isValidating, mutate } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const refetch = async (newFilter?: Filter) => {
    const key: SWRKey = ["students", newFilter];
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
