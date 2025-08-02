import { api } from "@/util/api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContractFunctionExecutionError } from "viem";

const mutationKey = "vote-applicant";

type VoteApplicantPayload = {
  programId: string;
  voter: string;
  applicantAddress: string;
};

export function useVoteApplicantApiV2() {
  return useMutation({
    onMutate: () => {
      toast.loading("Voting Program", { id: mutationKey });
    },
    onSuccess: () => {
      toast.success("Voting Created", { id: mutationKey });
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.error(error);
      toast.error("Voting Failed", { id: mutationKey });
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: VoteApplicantPayload) => {
      const response = await api.post("/vote", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    },
  });
}
