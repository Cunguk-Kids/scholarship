import { skoolchainAddress } from "@/constants/contractAddress";
import { scholarshipAbi } from "@/repo/abi";
import { api } from "@/repo/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { ethers } from "ethers";
const skInterface = new ethers.Interface(scholarshipAbi);
const programCreated = skInterface.getEvent("ProgramCreated");

export function useCreateProgram() {
  const { writeContractAsync, ...contractMutation } = useWriteContract();
  const queryClient = useQueryClient();
  const config = useConfig();
  const account = useAccount();
  const mutation = useMutation({
    mutationFn: async (props: {
      target: number;
      start: number;
      end: number;
      title: string;
      description: string;
    }) => {
      if (!account.address) throw new Error("Must Login First");
      const result = await api.v1.program.gen.post({
        title: props.title,
        description: props.description,
      });
      if (result.error) throw result.error;
      const txHash = await writeContractAsync({
        abi: scholarshipAbi,
        address: skoolchainAddress,
        functionName: "createProgram",
        args: [
          result.data.url,
          BigInt(props.target),
          BigInt(props.start),
          BigInt(props.end),
        ],
      });
      const waited = await waitForTransactionReceipt(config, { hash: txHash });
      const hs = waited.logs.find(
        (log) =>
          log.address.toLowerCase() === skoolchainAddress.toLowerCase() &&
          log.topics[0] === programCreated?.topicHash
      );
      if (!hs) throw new Error("Logs hash not found");
      const log = skInterface.parseLog(hs);
      if (!log?.args) throw new Error("Failed to create program");
      const [id, clonedAddress] = log.args;
      await api.v1.program.post({
        contractAddress: clonedAddress,
        description: result.data.metadata.description,
        title: result.data.metadata.title,
        id: id + "",
        initiatorAddress: account.address,
        endDate: new Date(props.end).toISOString(),
        startDate: new Date(props.start).toISOString(),
        metadataCid: result.data.url,
        targetApplicant: props.target + "",
      });
    },
    onError: (e) => {
      console.error(e);
    },
    onMutate: () => {},
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["programs"] });
    },
    mutationKey: ["createProgram", account.address],
  });

  return [mutation, contractMutation] as const;
}
