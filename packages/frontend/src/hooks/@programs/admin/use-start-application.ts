import { useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "../../../repo/abi";

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
  const write = (props: { applicant: bigint; }) =>
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: "0x-dummy",
      functionName: "startApplication",
      args: [props.applicant],
    });

  return [write, query] as const;
}
