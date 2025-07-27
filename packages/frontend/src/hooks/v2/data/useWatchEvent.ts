import { useWatchContractEvent } from "wagmi";
import { useSWRConfig } from "swr";
import { scholarshipProgramAbi } from "@/repo/abi";

export function useProgramsEventWatcher() {
  const { mutate } = useSWRConfig();

  useWatchContractEvent({
    address: "0xYourProgramContract",
    abi: scholarshipProgramAbi,
    eventName: "AddMilestone",
    onLogs: () => {
      mutate("programs");
    },
  });
}