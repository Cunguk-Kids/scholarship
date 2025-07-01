import { useWriteContract } from "wagmi";
import { scholarshipAbi } from "../../repo/abi";
import { skoolchainAddress } from "../../constants/contractAddress";

export function useApplyApplicant() {
  const query = useWriteContract();
  /**
   * @function write
   * @description Applies for a scholarship.
   * @param {Object} props
   * @param {BigInt[]} props.milestones The milestone prices.
   * @param {String} props.metadataUri The URI of the metadata associated with the scholarship.
   * @returns {UseContractResponse} write - The write contract function.
   */
  const write = (props: { milestones: bigint[]; metadataUri: string }) =>
    query.writeContract({
      abi: scholarshipAbi,
      address: skoolchainAddress,
      functionName: "applyApplicant",
      args: [props.milestones, props.metadataUri],
    });

  return [write, query] as const;
}
