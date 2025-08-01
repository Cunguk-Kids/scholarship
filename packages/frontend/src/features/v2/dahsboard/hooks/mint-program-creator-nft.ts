import { skoolchainV2Address } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { uploadToIPFS } from "@/services/api/ipfs.service";
import { createMetadataNFT } from "@/util/cleanCID";
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
      const { imageURL } = await uploadToIPFS({ file: data.file });
      const { metadataURL } = await uploadToIPFS({
        meta: createMetadataNFT({
          imageURL,
          description: "Program Creator NFT",
          name: "Program Creator NFT - " + data.programId,
          owner: account.address,
        }),
      });

      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: "mintProgramCreator",
        args: [BigInt(data.programId), metadataURL],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
