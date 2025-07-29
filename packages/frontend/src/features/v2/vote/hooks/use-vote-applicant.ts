
import { api } from "@/util/api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContractFunctionExecutionError, type Address } from "viem";
import { useAccount } from "wagmi";

const mutationKey = "vote-applicant";

export function useVoteApplicantV2() {
  const account = useAccount();
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
    mutationKey: [mutationKey, account.address],
    mutationFn: async (data: {
      programId: number;
      applicantAddress: Address;
    }) => {
      if (!account.address) return;
      // @ts-expect-error unsafe binding
      data.voter = account.address;
      console.log(data, "---data-voter---");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_HOST}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) return response.json();
      throw new Error(await response.text());
    },
  });
}

type VoteApplicantPayload = {
  programId: string;
  voter: string;
  applicantAddress: string;
};

export function useVoteApplicantApiV2() {
  return useMutation({
    mutationKey: [mutationKey],
    mutationFn: async (data: VoteApplicantPayload) => {
      const response = await api.post("/vote", data);
      return response.data;
    },
    onMutate: () => {
      console.log("sending request via API...");
    },
    onSuccess: () => {
      console.log("vote successful!");
    },
    onError: (err) => {
      console.error("vote failed", err);
    },
  });
}
