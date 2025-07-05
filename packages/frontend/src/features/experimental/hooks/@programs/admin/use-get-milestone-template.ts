import { useReadContract } from "wagmi";
import { scholarshipProgramAbi } from "../../../../../repo/abi";
import { appStateInjection } from "@/hooks/inject/app-state";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";
import { useEffect } from "react";

export function useGetMilestoneTemplate() {
  const { data: { address } } = ExperimentalInjection.use();

  const {
    blockNumber: { data: blockNumber },
  } = appStateInjection.use();
  const { data: milestones, refetch } = useReadContract({
    address: address || "0x",
    abi: scholarshipProgramAbi,
    functionName: "getAllMilestoneTemplates",
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return { milestones };
}
