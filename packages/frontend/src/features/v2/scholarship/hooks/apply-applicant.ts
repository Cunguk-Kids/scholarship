import { skoolchainV2Address } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { uploadToIPFS } from "@/services/api/ipfs.service";
import { cleanCID } from "@/util/cleanCID";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContractFunctionExecutionError, parseEther } from "viem";
import { useAccount, useBalance, useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useGetFaucet } from "./get-faucet";

const mutationKey = "apply-applicant";

type MilestoneData = {
  type: string;
  description: string;
  amount: string;
};

type ApplicantFormData = {
  fullName: string;
  email: string;
  studentId: string;
  milestones: MilestoneData[];
};

export function useApplyApplicantV2(programId: string) {
  const faucet = useGetFaucet();
  const balance = useBalance();
  const account = useAccount();
  const { writeContractAsync } = useWriteContract({
    mutation: {
      onMutate: () => {
        toast.loading("Calling Contract", { id: mutationKey });
      },

      onSuccess: () => {
        toast.loading("Waiting For Transaction", { id: mutationKey });
      },
    },
  });
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      toast.loading("Applying Program...", { id: mutationKey });
    },
    onSuccess: () => {
      toast.success("Program Applied!", { id: mutationKey });
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.error(error);
      toast.error(
        "Apply Program Failed!: " + (error.shortMessage ?? error.message),
        { id: mutationKey }
      );
    },
    mutationKey: [mutationKey, programId],
    mutationFn: async (data: ApplicantFormData) => {

      if ((balance.data?.value ?? 0n) < parseEther("0.0001")) {
       await faucet.mutateAsync(account.address ?? "0x0"); 
      }

      const milestones = await Promise.all(
        data.milestones.map(async (mile) => {
          const ipfs = await uploadToIPFS({ meta: mile });
          return {
            amount: BigInt(Math.round(Number(mile.amount) * 1e6)),
            metadataCID: cleanCID(ipfs?.metaCID),
          };
        })
      );

      const ipfs = await uploadToIPFS({
        meta: {
          fullName: data.fullName,
          email: data.email,
          // TODO: add financial situation
          financialSituation: "",
          scholarshipMotivation: "",
          studentId: data.studentId,
        },
      });
      const cid = cleanCID(ipfs?.metaCID);

      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: "applyAppplicant",
        args: [BigInt(programId), milestones, cid],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
