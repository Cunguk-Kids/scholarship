import { usdcAddress } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { useMutation } from "@tanstack/react-query";
import { ContractFunctionExecutionError } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "withdraw-milestone";

type MutationProps = {
  programId: string;
};

export function useWithdrawMilestoneV2() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      console.log("Withdrawing Milestone...");
    },
    onSuccess: () => {
      console.log("Milestone Withdrawed!");
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, "Withdraw Milestone Failed!");
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: MutationProps) => {
      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: usdcAddress,
        functionName: "withdrawMilestone",
        args: [BigInt(data.programId)],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
