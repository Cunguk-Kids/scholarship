import { useReadContract, useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "@/repo/abi";
import type { Address } from "viem";

export function useWithdrawMilestone(address: Address) {
  const query = useWriteContract();
  /**
   * @function write
   * @description Initiates a contract call to withdraw a milestone for an applicant.
   * @param {Object} props - The properties for the contract call.
   * @param {bigint} props.batch - The batch number of the milestone.
   * @param {bigint} props.id - The ID of the milestone to withdraw.  * @param {string} props.metadataProve - The metadata proving milestone completion.  * @returns {UseContractResponse} - The response from the contract write operation.
   */

  const appBatch = useReadContract({
    address: address,
    abi: scholarshipProgramAbi,
    functionName: "appBatch",
  });

  const write = (props: { id: bigint; metadataProve: string }) => {
    if (appBatch.data === undefined) return;
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: address,
      functionName: "withrawMilestone",
      args: [appBatch.data, props.id],
    });
  };

  const writeAsync = (props: { id: bigint; metadataProve: string }) => {
    if (appBatch.data === undefined) return;
    return query.writeContractAsync({
      abi: scholarshipProgramAbi,
      address: address,
      functionName: "withrawMilestone",
      args: [appBatch.data, props.id],
    });
  };

  return [write, query, writeAsync] as const;
}
