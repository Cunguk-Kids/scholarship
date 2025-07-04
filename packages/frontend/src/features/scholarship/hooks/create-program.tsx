import { skoolchainAddress } from "@/constants/contractAddress";
import { scholarshipAbi } from "@/repo/abi";
import { api } from "@/repo/api";
import { useMutation } from "@tanstack/react-query";
import { useWriteContract } from "wagmi";

export function useCreateProgram() {
  const { writeContractAsync, ...contractMutation } = useWriteContract();
  const mutation = useMutation({
    mutationFn: async (props: {
      target: number;
      start: number;
      end: number;
      title: string;
      description: string;
    }) => {
      const result = await api.v1.program.post({
        title: props.title,
        description: props.description,
      });
      await writeContractAsync({
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
      return result;
    },
    onError: (e) => {
      console.error(e);
    },
    onMutate: () => {
    },
    onSuccess: () => {
    },
  });

  return [mutation, contractMutation] as const;
}
