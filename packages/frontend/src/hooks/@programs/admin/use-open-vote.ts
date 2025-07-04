import { useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "../../../repo/abi";

export function useOpenVote() {
  const query = useWriteContract();
  /**
   * @function useOpenVote
   * @description Opens the voting phase.
   * @returns {Function} write - A function to open the voting phase.
   */
  const write = () =>
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: "0x-dummy",
      functionName: "openVote",
      args: [],
    });

  return [write, query] as const;
}
