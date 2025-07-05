import { scholarshipProgramAbi } from "@/repo/abi";
import { api } from "@/repo/api";
import { useQuery } from "@tanstack/react-query";
import { useReadContracts } from "wagmi";

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

export function useGetProgramContract(address: `0x${string}`) {
  const { data, ...queryStatus } = useReadContracts({
    contracts: [
      {
        abi: scholarshipProgramAbi,
        address,
        functionName: "getApplicantSize",
        args: [],
      },
      {
        abi: scholarshipProgramAbi,
        address,
        functionName: "getAppStatus",
        args: [],
      },
      {
        abi: scholarshipProgramAbi,
        address,
        functionName: "stackedToken",
        args: [],
      },
    ],
  });

  const [applicantSize, appStatus, stackedToken] = data ?? [];

  return { applicantSize, appStatus, stackedToken, queryStatus };
}
