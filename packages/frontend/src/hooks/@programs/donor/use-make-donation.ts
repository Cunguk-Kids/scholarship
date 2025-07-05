import { useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "@/repo/abi";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";
import { parseEther } from "viem";

export function useMakeDonation() {
  const query = useWriteContract();
  const { data: { address } } = ExperimentalInjection.use();
  /**
   * @function useMakeDonation
   * @description Starts a new donation.
   * @returns {Function} make some donation to contract.
   */
  const write = (value: string) =>
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: address || "0x",
      functionName: "donateContract",
      args: [],
      value: parseEther(value),
    });

  return [write, query] as const;
}
