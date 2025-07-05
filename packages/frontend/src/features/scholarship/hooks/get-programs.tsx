import { api } from "@/repo/api";
import { useQuery } from "@tanstack/react-query";

export function useGetPrograms() {
  const { data: programs } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const result = await api.v1.program.all.get();
      if (result.error) throw result.error;
      return result.data;
    },
  });

  return { programs };
}
