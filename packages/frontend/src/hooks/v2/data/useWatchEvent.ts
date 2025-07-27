import { useWatchContractEvent } from "wagmi";
import { useSWRConfig } from "swr";
import { skoolchainV2Abi } from "@/repo/abi";
import { skoolchainV2Address } from "@/constants/contractAddress";


export function useProgramsEventWatcher() {
  const { mutate } = useSWRConfig();

  useWatchContractEvent({
    address: skoolchainV2Address,
    abi: skoolchainV2Abi,
    eventName: "ProgramCreated",
    onLogs: () => {
      mutate("programs");
    },
  });
}

export function useProgramsVoteWatcher() {
  const { mutate } = useSWRConfig();

  useWatchContractEvent({
    address: skoolchainV2Address,
    abi: skoolchainV2Abi,
    eventName: "OnVoted",
    onLogs: () => {
      mutate("votes");
    },
  });
}
export function useProgramsStudentWatcher() {
  const { mutate } = useSWRConfig();

  useWatchContractEvent({
    address: skoolchainV2Address,
    abi: skoolchainV2Abi,
    eventName: "ApplicantRegistered",
    onLogs: () => {
      mutate("students");
    },
  });
}
export function useProgramsMilestonesWatcher() {
  const { mutate } = useSWRConfig();

  useWatchContractEvent({
    address: skoolchainV2Address,
    abi: skoolchainV2Abi,
    eventName: "MilestoneAdded",
    onLogs: () => {
      mutate("milestones");
    },
  });
}