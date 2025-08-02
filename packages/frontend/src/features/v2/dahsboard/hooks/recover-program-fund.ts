import { skoolchainV2Address } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContractFunctionExecutionError } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "recover-program-fund";

type MutationProps = {
  programId: string;
};

export function useRecoverProgramFundV2() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      toast.loading("Recovering Program Fund...", { id: mutationKey });
    },
    onSuccess: () => {
      toast.success("Program Fund Recovered!", { id: mutationKey });
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.error(error);
      toast.error(
        "Recovering Program Fund Failed! " +
          (error.shortMessage ?? error.message),
        { id: mutationKey }
      );
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: MutationProps) => {
      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: "recoverProgramFund",
        args: [BigInt(data.programId)],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
