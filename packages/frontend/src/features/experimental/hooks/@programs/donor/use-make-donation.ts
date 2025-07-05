import { useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "../../../../../repo/abi";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";

export function useMakeDonation() {
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
      functionName: "makeDonation",
      args: [],
      value: BigInt(10 * 1e18)
    });

  return [write, query] as const;
}
