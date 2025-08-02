import { skoolchainV2Address } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { wait } from "@/util/supense";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContractFunctionExecutionError } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "approve-milestone";

export function useApproveMilestoneV2() {
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      toast.loading("Approving Milestone...", { id: mutationKey });
    },
    onSuccess: () => {
      toast.success("Milestone Approved", { id: mutationKey });
      queryClient.invalidateQueries({ queryKey: ["program-creator-profile"] });
    },
    onError: (error: ContractFunctionExecutionError) => {
      toast.error(error.shortMessage, { id: mutationKey });
    },
    mutationKey: [mutationKey],
    mutationFn: async (id: number) => {
      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: "approveMilestone",
        args: [BigInt(id)],
      });

      await waitForTransactionReceipt(config, { hash });

      // wait the indexer to catch the event
      await wait(5 * 1_000);
    },
  });
}
