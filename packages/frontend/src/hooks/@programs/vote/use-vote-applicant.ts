import { useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "@/repo/abi";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";

export function useVoteApplicant(propsAddress?: string) {
  const query = useWriteContract();
  const { data: { address } } = ExperimentalInjection.use();
  /**
   * @function useMakeDonation
   * @description Starts a new donation.
   * @returns {Function} make some donation to contract.
   */
  const write = (applicant: `0x${string}`) =>
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: propsAddress as "0x" || address || "0x",
      functionName: "voteContract",
      args: [
        applicant
      ],
    });

  return [write, query] as const;
}
