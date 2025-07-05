import { ExperimentalInjection } from "@/features/experimental/context/experimental-context";
import { scholarshipProgramAbi } from "@/repo/abi";
import { api } from "@/repo/api";
import { useMutation } from "@tanstack/react-query";
import { useWriteContract } from "wagmi";


export type MilestoneInput = {
  mType: number;
  price: bigint;
  templateId: bigint;
  metadata: string;
};

export function useAddMilestoneTemplate() {
  const { data: { address } } = ExperimentalInjection.use();

  const { writeContractAsync, ...contractMutation } = useWriteContract();
  const mutation = useMutation({
    mutationFn: async (props: {

      price: number;
      title: string;
      description: string;
    }) => {
      const result = await api.v1.program.post({
        title: props.title,
        description: props.description,
      });

      const input: MilestoneInput = {
        metadata: result.data.url,
        mType: 0,
        price: BigInt(props.price),
        templateId: BigInt(0)
      };
      await writeContractAsync({
        abi: scholarshipProgramAbi,
        address: address || "0x",
        functionName: "createTemplateMilestone",
        args: [input],
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
