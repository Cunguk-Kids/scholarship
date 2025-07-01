import { useWriteContract } from "wagmi";
import { scholarshipAbi } from "../../repo/abi";
import { skoolchainAddress } from "../../constants/contractAddress";

export function useCloseBatch() {
  const query = useWriteContract();
  /**
   * @function useCloseBatch
   * @description Closes the current application batch, marking it as completed.
   * @returns {void}
   */

  const write = () =>
    query.writeContract({
      abi: scholarshipAbi,
      address: skoolchainAddress,
      functionName: "closeBatch",
      args: [],
    });

  return [write, query] as const;
}
