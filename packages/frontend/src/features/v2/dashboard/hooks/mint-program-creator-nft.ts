import { skoolchainV2Address } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import {  uploadToIPFSNFT } from "@/services/api/ipfs.service";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContractFunctionExecutionError } from "viem";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "mint-program-creator-nft";

type MutationProps = {
  programId: string;
  file: File;
};

export function useMintProgramCreatorNFTV2() {
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      toast.loading("Minting Program Creator NFT...", { id: mutationKey });
    },
    onSuccess: () => {
      toast.success("Program Creator NFT Minted!", { id: mutationKey });
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, "---Mint Program Creator NFT Failed!");
      toast.error("Mint Failed!: " + (error.shortMessage ?? error.message), {
        id: mutationKey,
      });
    },
    mutationKey: [mutationKey, account.address],
    mutationFn: async (data: MutationProps) => {
      if (!account.address) throw new Error("Must Login First");

      const result = await uploadToIPFSNFT({
        file: data.file,
        name: "Program Creator NFT - " + data.programId,
        description: "Program Creator NFT",
        owner: account.address,
      });

      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: "mintProgramCreator",
        args: [BigInt(data.programId), result.metadataURL],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
