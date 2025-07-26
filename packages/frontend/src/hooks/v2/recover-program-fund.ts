import { usdcAddress } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { useMutation } from "@tanstack/react-query";
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
      console.log("Recovering Program Fund...");
    },
    onSuccess: () => {
      console.log("Program Fund Recovered!");
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, "Recover Program Fund Failed!");
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: MutationProps) => {
      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: usdcAddress,
        functionName: "recoverProgramFund",
        args: [BigInt(data.programId)],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
