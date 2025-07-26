import { usdcAddress } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
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
      const milestones = data.milestones.map((mile) => ({
        amount: BigInt(mile.amount),

        // must replace with actual cid
        metadataCID: "",
      }));

      const hash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: usdcAddress,
        functionName: "applyAppplicant",
        args: [BigInt(programId), milestones, ""],
      });

      await waitForTransactionReceipt(config, { hash });
    },
  });
}
