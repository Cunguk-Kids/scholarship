import { useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "../../../repo/abi";

export function useOpenDonation() {
  const query = useWriteContract();

  /**
   * @function useOpenDonation
   * @description Opens the donation phase.
   * @returns {void}
   */
  const write = () =>
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: "0x-dummy",
      functionName: "openDonation",
      args: [],
    });

  return [write, query] as const;
}
