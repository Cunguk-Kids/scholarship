import { useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "@/repo/abi";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";

export function useCloseBatch() {
  const query = useWriteContract();
  const { data: { address } } = ExperimentalInjection.use();
  /**
   * @function useCloseBatch
   * @description Opens the donation phase.
   * @returns {void}
   */
  const write = () =>
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: address || "0x001",
      functionName: "closeBatch",
      args: [],
    });

  return [write, query] as const;
}
