import { useWriteContract } from "wagmi";
import { scholarshipAbi } from "../../repo/abi";
import { skoolchainAddress } from "../../constants/contractAddress";

export function useWithdrawMilestone() {
  const query = useWriteContract();
  /**
   * @function write
   * @description Initiates a contract call to withdraw a milestone for an applicant.
   * @param {Object} props - The properties for the contract call.
   * @param {bigint} props.batch - The batch number of the milestone.
   * @param {bigint} props.id - The ID of the milestone to withdraw.
   * @param {string} props.metadataProve - The metadata proving milestone completion.
   * @returns {UseContractResponse} - The response from the contract write operation.
   */

  const write = (props: { batch: bigint; id: bigint; metadataProve: string }) =>
    query.writeContract({
      abi: scholarshipAbi,
      address: skoolchainAddress,
      functionName: "withrawMilestone",
      args: [props.batch, props.id, props.metadataProve],
    });

  return [write, query] as const;
}
