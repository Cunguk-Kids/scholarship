import type { FormDataProvider } from '@/components/CardForm';
import { skoolchainV2Address, usdcAddress } from '@/constants/contractAddress';
import { skoolchainV2Abi } from '@/repo/abi';
import { useMutation } from '@tanstack/react-query';
import { ContractFunctionExecutionError, erc20Abi } from 'viem';
import { useConfig, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

const mutationKey = 'create-program';

const day = 60n * 60n * 24n;

export function useCreateProgramV2() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      console.log('Creating program...');
    },
    onSuccess: () => {
      console.log('Program created!');
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.log(error, 'Program creation failed!');
    },
    mutationKey: [mutationKey],
    mutationFn: async (data: FormDataProvider) => {
      const totalFund = BigInt(data.totalFund) * 10n ** 6n;
      const deadlineForApplication = BigInt((new Date(data.deadline).getTime() / 1_000) | 0);
      const now = BigInt((Date.now() / 1_000) | 0); // now in seconds

      const dates = [
        now + 1n * day,
        deadlineForApplication,
        deadlineForApplication + day * 2n,
        deadlineForApplication + day * 4n,
      ] as const;

      const approveHash = await writeContractAsync({
        abi: erc20Abi,
        address: usdcAddress,
        functionName: 'approve',
        args: [skoolchainV2Address, totalFund],
      });

      await waitForTransactionReceipt(config, { hash: approveHash });

      const programCreationHash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: 'createProgram',
        args: [totalFund, dates, '', 0],
      });

      await waitForTransactionReceipt(config, { hash: programCreationHash });
    },
  });
}
