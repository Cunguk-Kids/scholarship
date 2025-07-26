import { usdcAddress } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { useMutation } from "@tanstack/react-query";
import { ContractFunctionExecutionError } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "mint-program-creator-nft";

type MutationProps = {
    programId: string;
    metadataCID: string;
};

export function useMintProgramCreatorNFTV2() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      console.log("Mint Program Creator NFT...");
    },
    onSuccess: () => {
      console.log("Program Creator NFT Minted!");
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, "Mint Program Creator NFT Failed!");
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: MutationProps) => {
      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: usdcAddress,
        functionName: "mintProgramCreator",
        args: [BigInt(data.programId), data.metadataCID],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
