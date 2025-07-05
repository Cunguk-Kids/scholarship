import { useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "../../../../../repo/abi";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";

export function useOpenVote() {
  const query = useWriteContract();
  const { data: { address } } = ExperimentalInjection.use();

  /**
   * @function useOpenVote
   * @description Opens the voting phase.
   * @returns {Function} write - A function to open the voting phase.
   */
  const write = () =>
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: address || "0x001",
      functionName: "openVote",
      args: [],
    });

  return [write, query] as const;
}
