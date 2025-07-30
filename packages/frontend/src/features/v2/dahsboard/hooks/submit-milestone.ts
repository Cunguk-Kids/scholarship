import { skoolchainV2Address } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { uploadToIPFS } from "@/services/api/ipfs.service";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContractFunctionExecutionError } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "submit-milestone";

export function useSubmitMilestoneV2() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      toast.loading("Submiting Milestone...", { id: mutationKey });
    },
    onSuccess: () => {
      toast.success("Milestone Submited", { id: mutationKey });
    },
    onError: (error: ContractFunctionExecutionError) => {
      toast.error(error.shortMessage, { id: mutationKey });
    },
    mutationKey: [mutationKey],
    mutationFn: async ([id, data]: [
      id: string,
      data: { proveImage: File; description: string },
    ]) => {
      const image = await uploadToIPFS({ file: data.proveImage });
      console.log(image.imageURL);
      const meta = await uploadToIPFS({
        meta: {
          proveImage: image.imageURL,
          description: data.description,
        },
      });
      console.log(meta.metadataURL);
      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: "submitMilestone",
        args: [BigInt(id), meta.metadataURL],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
