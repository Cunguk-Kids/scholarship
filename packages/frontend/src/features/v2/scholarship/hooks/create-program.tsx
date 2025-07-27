import type { FormDataProvider } from "@/components/CardForm";
import { skoolchainV2Address, usdcAddress } from "@/constants/contractAddress";
import { skoolchainV2Abi } from "@/repo/abi";
import { uploadToIPFS } from "@/services/api/ipfs.service";
import { cleanCID } from "@/util/cleanCID";
import { useMutation } from "@tanstack/react-query";
import { ContractFunctionExecutionError, erc20Abi } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const mutationKey = "create-program";

const day = 60n * 60n * 24n;

export function useCreateProgramV2() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      console.log("Creating program...");
    },
    onSuccess: () => {
      console.log("Program created!");
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, "Program creation failed!");
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: FormDataProvider) => {
      const totalFund = BigInt(data.totalFund) * 10n ** 6n;
      const deadlineForApplication = BigInt(
        (new Date(data.deadline).getTime() / 1_000) | 0
      );
      const now = BigInt((Date.now() / 1_000) | 0); // now in seconds

      const dates = [
        now + 60n,
        deadlineForApplication,
        deadlineForApplication + day * 2n,
        deadlineForApplication + day * 4n,
      ] as const;

      const modifiedData = data as Record<string, unknown>;
      modifiedData.openedAt = Number(dates[0]);
      modifiedData.votingAt = Number(dates[1]);
      modifiedData.ongoingAt = Number(dates[2]);
      modifiedData.closedAt = Number(dates[3]);

      const approveHash = await writeContractAsync({
        abi: erc20Abi,
        address: usdcAddress,
        functionName: "approve",
        args: [skoolchainV2Address, totalFund],
      });
      const ipfs = await uploadToIPFS({ meta: data });

      await waitForTransactionReceipt(config, { hash: approveHash });

      const programCreationHash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: "createProgram",
        args: [totalFund, dates, cleanCID(ipfs?.metaCID), 0],
      });

      await waitForTransactionReceipt(config, { hash: programCreationHash });
    },
  });
}
