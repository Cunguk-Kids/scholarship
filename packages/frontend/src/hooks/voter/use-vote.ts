import { useWriteContract } from "wagmi";
import { scholarshipAbi } from "../../repo/abi";
import { skoolchainAddress } from "../../constants/contractAddress";
import type { Address } from "viem";

export function useDonate() {
  const query = useWriteContract();
  /**
   * @function write
   * @description Casts a vote for a scholarship applicant on the blockchain.
   * @param {Object} props
   * @param {Address} props.applicantAddress - The blockchain address of the applicant to vote for.
   * @returns {UseContractResponse} write - The write contract function.
   */

  const write = (props: { applicantAddress: Address }) =>
    query.writeContract({
      abi: scholarshipAbi,
      address: skoolchainAddress,
      functionName: "vote",
      args: [props.applicantAddress],
    });

  return [write, query] as const;
}
