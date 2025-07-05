import { createInjection } from '@/util/create-inject';
import { useRef, useState } from 'react';
import { useBalance } from 'wagmi';
import type { MilestoneInput } from '@/hooks/@programs/admin/use-add-milestone-template';

function useRootState() {
  const [address, setAddress] = useState<`0x` | null>(null);
  const id = useRef('');
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneInput[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<`0x${string}`>('0x');

  const handleSelectMilestone = (milestone: MilestoneInput) => {
    setSelectedMilestone((prev) => {
      const exists = prev.find((m) => m.templateId === milestone.templateId);

      if (exists) {
        return prev.filter((m) => m.templateId !== milestone.templateId);
      } else {
        return [...prev, milestone];
      }
    });
  };

  const handleSelectParticipant = (participant: `0x${string}`) => {
    setSelectedParticipant((prev) => {
      if (participant === prev) return '0x';
      return participant;
    });
  };

  const contractBalance = useBalance({
    address: address || '0x',
  });

  return {
    ref: {
      id,
    },
    setter: {
      setAddress,
      handleSelectMilestone,
      handleSelectParticipant,
    },
    data: {
      address,
      contractBalance,
      selectedMilestone,
      selectedParticipant,
      id,
    },
  };
}

export const RootInjection = createInjection(useRootState);
