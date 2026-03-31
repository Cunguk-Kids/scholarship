import { skoolchainV2Address } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { uploadToIPFSNFT } from "@/services/api/ipfs.service";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContractFunctionExecutionError } from "viem";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "mint-applicant-nft";

type MutationProps = {
  programId: string;
  studentId: string;
  file: File;
};

export function useMintApplicantNFTV2() {
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      toast.loading("Minting Applicant NFT...", { id: mutationKey });
    },
    onSuccess: () => {
      toast.success("Applicant NFT Minted!", { id: mutationKey });
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, "---Mint Applicant NFT Failed!");
      toast.error("Mint Failed!: " + (error.shortMessage ?? error.message), {
        id: mutationKey,
      });
    },
    mutationKey: [mutationKey, account.address],
    mutationFn: async (data: MutationProps) => {
      if (!account.address) throw new Error("Must Login First");
      const { metadataURL } = await uploadToIPFSNFT({
        description: "Student NFT",
        name: "Student NFT - " + data.studentId,
        file: data.file,
        owner: account.address,
      });

      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: "mintApplicant",
        args: [BigInt(data.programId), metadataURL],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
