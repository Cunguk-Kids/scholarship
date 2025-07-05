import { useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "../../../../../repo/abi";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";

export function useApplyProgram() {
  const query = useWriteContract();
  const { data: { address } } = ExperimentalInjection.use();
  /**
   * @function useMakeDonation
   * @description Starts a new donation.
   * @returns {Function} make some donation to contract.
   */
  const write = () =>
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: address || "0x",
      functionName: "applyProgramContract",
      args: [
        [
          {
            mType: 0,
            price: BigInt(0),
            templateId: BigInt(0),
            metadata: "",
          },
        ],
      ],
    });

  return [write, query] as const;
}
