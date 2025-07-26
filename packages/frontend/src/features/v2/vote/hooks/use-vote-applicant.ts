import { usdcAddress } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { useMutation } from "@tanstack/react-query";
import { ContractFunctionExecutionError, type Address } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "vote-applicant";

export function useVoteApplicantV2() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      console.log("Voting program...");
    },
    onSuccess: () => {
      console.log("Voting created!");
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, "Voting failed!");
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: {
      programId: string;
      voter: Address;
      applicantAddress: Address;
    }) => {
      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: usdcAddress,
        functionName: "voteApplicant",
        args: [BigInt(data.programId), data.voter, data.applicantAddress],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
