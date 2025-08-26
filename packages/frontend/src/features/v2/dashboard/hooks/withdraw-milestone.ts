import { skoolchainV2Address } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContractFunctionExecutionError } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "withdraw-milestone";

type MutationProps = {
  programId: number;
};

export function useWithdrawMilestoneV2() {
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      toast.loading("Withdrawing Milestone...", { id: mutationKey });
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: "balanceOf" as never });
      toast.success("Milestone Withdrawed!", { id: mutationKey });
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.error(error);
      toast.error(
        "Withdraw Milestone Failed! " + (error.shortMessage ?? error.message),
        { id: mutationKey }
      );
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: MutationProps) => {
      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: "withdrawMilestone",
        args: [BigInt(data.programId)],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
