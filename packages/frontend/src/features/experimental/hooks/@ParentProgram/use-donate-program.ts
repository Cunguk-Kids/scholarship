import { useWriteContract } from "wagmi";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";
import { scholarshipProgramAbi } from "@/repo/abi";

export function useDonateToProgram() {
  const query = useWriteContract();
  const { data: { address } } = ExperimentalInjection.use();
  /**
   * @function useDonateToProgram
   * @description Starts a new donation.
   * @returns {Function} make some donation to contract.
   */
  const write = () =>
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: address || "0x",
      functionName: "donateContract",
      args: [],
      value: BigInt(10 * 1e18)
    });

  return [write, query] as const;
}
