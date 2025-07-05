import { useWriteContract } from "wagmi";
import { scholarshipAbi } from "../../../../repo/abi";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";

export function useApplyProgram() {
  const query = useWriteContract();
  const { data: { address } } = ExperimentalInjection.use();
  /**
   * @function useMakeDonation
   * @description Starts a new donation.
   * @returns {Function} make some donation to contract.
   */
  const write = (programId: bigint, milestones: {
    mType: number,
    price: bigint,
    templateId: bigint,
    metadata: string;
  }[]) =>
    query.writeContract({
      abi: scholarshipAbi,
      address: address || "0x",
      functionName: "applyToProgram",
      args: [programId,
        milestones
      ],
    });

  return [write, query] as const;
}
