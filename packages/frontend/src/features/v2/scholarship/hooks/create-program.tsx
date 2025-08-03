import type { FormDataProvider } from '@/components/CardForm';
import { skoolchainV2Address, usdcAddress } from '@/constants/contractAddress';
import { skoolchainV2Abi } from '@/repo/abi';
import { uploadToIPFS } from '@/services/api/ipfs.service';
import { cleanCID } from '@/util/cleanCID';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
      toast.loading('Creating Program', { id: mutationKey });
    },
    onSuccess: () => {
      toast.success('Program Created', { id: mutationKey });
    },
    onError: (error: ContractFunctionExecutionError) => {
      console.error(error);
      toast.error('Program creation failed! ' + (error.shortMessage ?? error.message), {
        id: mutationKey,
      });
    },
    mutationKey: [mutationKey],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (data: FormDataProvider | any) => {
      const totalFund = BigInt(data.totalFund) * 10n ** 6n;
      const type = data.selectionMethod;
      const deadlineForApplication = BigInt((new Date(data.deadline).getTime() / 1_000) | 0);
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

      toast.loading('Approving USDC transfer...', { id: mutationKey });

      const approveHash = await writeContractAsync({
        abi: erc20Abi,
        address: usdcAddress,
        functionName: 'approve',
        args: [skoolchainV2Address, totalFund],
      });

      await waitForTransactionReceipt(config, { hash: approveHash });

      toast.loading('Uploading metadata to IPFS...', { id: mutationKey });

      const ipfs = await uploadToIPFS({ meta: data });

      toast.loading('Creating program on-chain...', { id: mutationKey });

      const programCreationHash = await writeContractAsync({
        abi: skoolchainV2Abi,
        address: skoolchainV2Address,
        functionName: 'createProgram',
        args: [totalFund, dates, cleanCID(ipfs?.metaCID), type === 'USER_DEFINED' ? 1 : 0],
      });

      await waitForTransactionReceipt(config, { hash: programCreationHash });
    },
  });
}
