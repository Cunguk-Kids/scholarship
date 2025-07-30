import { skoolchainV2Address } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { uploadToIPFS } from "@/services/api/ipfs.service";
import { cleanCID } from "@/util/cleanCID";
import { useMutation } from "@tanstack/react-query";
import { ContractFunctionExecutionError } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

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
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      console.log("Applying Program...");
    },
    onSuccess: () => {
      console.log("Program Applied!");
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, "Apply Program Failed!");
    },
    mutationKey: [mutationKey, programId],
    mutationFn: async (data: ApplicantFormData) => {
      const milestones = await Promise.all(
        data.milestones.map(async (mile) => {
          const ipfs = await uploadToIPFS({ meta: mile });
          return {
            amount: BigInt(mile.amount) * 10n ** 6n,
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
