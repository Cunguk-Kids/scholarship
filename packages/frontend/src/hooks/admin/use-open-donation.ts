import { useWriteContract } from "wagmi";
import { scholarshipAbi } from "../../repo/abi";
import { skoolchainAddress } from "../../constants/contractAddress";

export function useOpenDonation() {
  const query = useWriteContract();

  /**
   * @function useOpenDonation
   * @description Opens the donation phase.
   * @returns {void}
   */
  const write = () =>
    query.writeContract({
      abi: scholarshipAbi,
      address: skoolchainAddress,
      functionName: "openDonation",
      args: [],
    });

  return [write, query] as const;
}
