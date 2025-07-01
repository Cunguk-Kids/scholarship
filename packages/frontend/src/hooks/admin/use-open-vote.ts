import { useWriteContract } from "wagmi";
import { scholarshipAbi } from "../../repo/abi";
import { skoolchainAddress } from "../../constants/contractAddress";

export function useOpenVote() {
  const query = useWriteContract();
  /**
   * @function useOpenVote
   * @description Opens the voting phase.
   * @returns {Function} write - A function to open the voting phase.
   */
  const write = () =>
    query.writeContract({
      abi: scholarshipAbi,
      address: skoolchainAddress,
      functionName: "openVote",
      args: [],
    });

  return [write, query] as const;
}
