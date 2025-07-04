import { createInjection } from '@/util/create-inject';
import { useState } from 'react';
import { useBalance } from 'wagmi';

function useExperimentalState() {
  const [address, setAddress] = useState<`0x` | null>(null);
  const contractBalance = useBalance({
    address: address || '0x',
  });

  return {
    setter: {
      setAddress,
    },
    data: {
      address,
      contractBalance,
    },
  };
}

export const ExperimentalInjection = createInjection(useExperimentalState);
