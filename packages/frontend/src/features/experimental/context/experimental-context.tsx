import { createInjection } from "@/util/create-inject";
import { useRef, useState } from "react";
import { useBalance } from "wagmi";
import type { MilestoneInput } from "../hooks/@programs/admin/use-add-milestone-template";

function useExperimentalState() {
  const [address, setAddress] = useState<`0x` | null>(null);
  const id = useRef("");
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneInput[]>(
    []
  );

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

  const contractBalance = useBalance({
    address: address || "0x",
  });

  return {
    ref: {
      id,
    },
    setter: {
      setAddress,
      handleSelectMilestone,
    },
    data: {
      address,
      contractBalance,
      selectedMilestone,
    },
  };
}

export const ExperimentalInjection = createInjection(useExperimentalState);
