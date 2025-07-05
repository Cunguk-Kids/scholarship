import { skoolchainAddress } from '@/constants/contractAddress';
import { appStateInjection } from '@/hooks/inject/app-state';
import { scholarshipAbi } from '@/repo/abi';
import { useEffect } from 'react';
import { useReadContract } from 'wagmi';

export function useGetProgramsByAdrress() {
  const {
    blockNumber: { data: blockNumber },
  } = appStateInjection.use();
  const { data: programs, refetch } = useReadContract({
    address: skoolchainAddress,
    abi: scholarshipAbi,
    functionName: 'getProgramCreator',
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return { programs };
}
