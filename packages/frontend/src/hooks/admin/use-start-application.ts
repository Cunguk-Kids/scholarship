import { useWriteContract } from "wagmi";
import { scholarshipAbi } from "../../repo/abi";
import { skoolchainAddress } from "../../constants/contractAddress";

export function useStartApplication() {
  const query = useWriteContract();
  /**
   * @function useStartApplication
   * @description Starts a new application phase.
   * @param {Object} props
   * @param {BigInt} props.quorum The required number of votes for a milestone to be accepted.
   * @param {BigInt} props.applicantTarget The required number of applicants for the milestone to be considered completed.
   * @returns {Function} write - A function to start the application phase with the given quorum and applicant target.
   */
  const write = (props: { quorum: bigint; applicantTarget: bigint }) =>
    query.writeContract({
      abi: scholarshipAbi,
      address: skoolchainAddress,
      functionName: "startApplication",
      args: [props.quorum, props.applicantTarget],
    });

  return [write, query] as const;
}
