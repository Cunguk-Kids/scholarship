import { useReadContract } from "wagmi";
import { scholarshipProgramAbi } from "@/repo/abi";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";
import { useEffect } from "react";

export function useApplicant(propsAddress?: string) {
  const { data: { address } } = ExperimentalInjection.use();

  const { data: applicants, refetch } = useReadContract({
    address: propsAddress as "0x" || address || "0x",
    abi: scholarshipProgramAbi,
    functionName: "_getAllApplicantsWithVotes",
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { applicants };
}
