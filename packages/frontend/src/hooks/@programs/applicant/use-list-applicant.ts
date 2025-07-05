import { useReadContract } from "wagmi";
import { scholarshipProgramAbi } from "@/repo/abi";
import { appStateInjection } from "@/hooks/inject/app-state";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";
import { useEffect } from "react";

export function useApplicant() {
  const { data: { address } } = ExperimentalInjection.use();

  const {
    blockNumber: { data: blockNumber },
  } = appStateInjection.use();
  const { data: applicants, refetch } = useReadContract({
    address: address || "0x",
    abi: scholarshipProgramAbi,
    functionName: "_getAllApplicantsWithVotes",
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return { applicants };
}
