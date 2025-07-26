import { usdcAddress } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { useMutation } from "@tanstack/react-query";
import { ContractFunctionExecutionError } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "approve-milestone";

type MutationProps = {
  milestoneId: string;
};

export function useApproveMilestoneV2() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      console.log("Approving Milestone...");
    },
    onSuccess: () => {
      console.log("Milestone Approved!");
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, "Approve Milestone Failed!");
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: MutationProps) => {
      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: usdcAddress,
        functionName: "approveMilestone",
        args: [BigInt(data.milestoneId)],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
