import { useWriteContract } from "wagmi";
import { scholarshipAbi } from "../../repo/abi";
import { skoolchainAddress } from "../../constants/contractAddress";
import { parseEther } from "viem";

export function useDonate() {
  const query = useWriteContract();
  /**
   * @function write
   * @description Executes a donation transaction on the blockchain.
   * @param {Object} props
   * @param {String} props.metadataUri - The URI of the metadata associated with the donation.
   * @param {String} props.value - The value of the donation.
   * @returns {UseContractResponse} write - The write contract function.
   */
  const write = (props: { metadataUri: string; value: string }) =>
    query.writeContract({
      abi: scholarshipAbi,
      address: skoolchainAddress,
      functionName: "donate",
      args: [props.metadataUri],
      value: parseEther(props.value),
    });

  return [write, query] as const;
}
