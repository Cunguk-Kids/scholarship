import { usdcAddress } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { useMutation } from "@tanstack/react-query";
import { ContractFunctionExecutionError } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "submit-milestone";

type MutationProps = {
  milestoneId: string;
  proveCID: string;
};

export function useSubmitMilestoneV2() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      console.log("Submiting Milestone...");
    },
    onSuccess: () => {
      console.log("Milestone Submited!");
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, "Submit Milestone Failed!");
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: MutationProps) => {
      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: usdcAddress,
        functionName: "submitMilestone",
        args: [BigInt(data.milestoneId), data.proveCID],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
