import { useWriteContract } from "wagmi";
import { scholarshipProgramAbi } from "../../../../../repo/abi";
import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";

export function useOpenDonation() {
  const query = useWriteContract();
  const { data: { address } } = ExperimentalInjection.use();
  /**
   * @function useOpenDonation
   * @description Opens the donation phase.
   * @returns {void}
   */
  const write = () =>
    query.writeContract({
      abi: scholarshipProgramAbi,
      address: address || "0x001",
      functionName: "openDonation",
      args: [],
    });

  return [write, query] as const;
}
