import { scholarshipProgramAbi } from "@/repo/abi";
import type { Address } from "viem";
import { useReadContract } from "wagmi";

export function useGetMilestone(address: Address) {
  const query = useReadContract({
    abi: scholarshipProgramAbi,
    address,
    functionName: "getMilestone",
  });
  
  return query;
}
