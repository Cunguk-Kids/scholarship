import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import toast from "react-hot-toast";
import { v4Addresses, scholarshipCoreAbi } from "@/constants/contractsV4";
import { Program } from "@/lib/api";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoModal } from "@/components/ui/NeoModal";

// Simplified enum map matching the smart contract
const PROGRAM_STATUSES = [
  { value: 0, label: "0 - CREATED" },
  { value: 1, label: "1 - APPLICATION_OPEN" },
  { value: 2, label: "2 - SCREENING" },
  { value: 3, label: "3 - VOTING" },
  { value: 4, label: "4 - ACTIVE" },
  { value: 5, label: "5 - COMPLETED" },
  { value: 6, label: "6 - CANCELLED" }
];

export function AdminControlModal({
  program,
  isOpen,
  onClose
}: {
  program: Program;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"status" | "dates">("status");
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  
  const formatEpoch = (dateStr: string) => {
    if (!dateStr || dateStr === "0") return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  };

  const [dates, setDates] = useState({
    appStart: formatEpoch(program.applicationStart),
    appEnd: formatEpoch(program.applicationEnd),
    voteStart: formatEpoch(program.votingStart),
    voteEnd: formatEpoch(program.votingEnd),
  });

  const { writeContractAsync } = useWriteContract();

  const handleForceStatus = async () => {
    try {
      const txLine = await writeContractAsync({
        address: v4Addresses.ScholarshipCore,
        abi: scholarshipCoreAbi,
        functionName: "adminForceStatus",
        args: [BigInt(program.blockchainId), selectedStatus],
      });
      toast.success("Transaction submitted to force status!");
      onClose();
    } catch (e: any) {
      toast.error(e.shortMessage || "Failed to force status");
    }
  };

  const handleUpdateDates = async () => {
    try {
      const getEpoch = (iso: string) => Math.floor(new Date(iso).getTime() / 1000);
      
      await writeContractAsync({
        address: v4Addresses.ScholarshipCore,
        abi: scholarshipCoreAbi,
        functionName: "adminUpdateDates",
        args: [
          BigInt(program.blockchainId),
          BigInt(getEpoch(dates.appStart)),
          BigInt(getEpoch(dates.appEnd)),
          BigInt(getEpoch(dates.voteStart)),
          BigInt(getEpoch(dates.voteEnd)),
        ],
      });
      toast.success("Transaction submitted to update dates!");
      onClose();
    } catch (e: any) {
      toast.error(e.shortMessage || "Failed to update dates");
    }
  };

  return (
    <NeoModal isOpen={isOpen} onClose={onClose} title={`Admin: Program ${program.blockchainId}`}>
      <div className="flex gap-2 mb-6">
        <button
          className={`flex-1 py-2 font-bold rounded-lg border-2 border-black transition-colors ${
            activeTab === "status" ? "bg-skpurple text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]" : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("status")}
        >
          Force Status
        </button>
        <button
          className={`flex-1 py-2 font-bold rounded-lg border-2 border-black transition-colors ${
            activeTab === "dates" ? "bg-skpurple text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]" : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("dates")}
        >
          Update Dates
        </button>
      </div>

      {activeTab === "status" ? (
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-600">Current Status: {program.status}</p>
          <div>
            <label className="block text-sm font-bold mb-2">Target Status</label>
            <select
              className="w-full p-3 rounded-lg border-2 border-black neo-shadow-sm font-bold bg-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(Number(e.target.value))}
            >
              {PROGRAM_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <NeoButton
            label="Execute Force Status"
            variant="primary"
            fullWidth
            onClick={handleForceStatus}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Application Start</label>
              <input
                type="datetime-local"
                value={dates.appStart}
                onChange={(e) => setDates(d => ({ ...d, appStart: e.target.value }))}
                className="w-full p-2 border-2 text-sm border-black rounded-lg neo-shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Application End</label>
              <input
                type="datetime-local"
                value={dates.appEnd}
                onChange={(e) => setDates(d => ({ ...d, appEnd: e.target.value }))}
                className="w-full p-2 border-2 text-sm border-black rounded-lg neo-shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Voting Start</label>
              <input
                type="datetime-local"
                value={dates.voteStart}
                onChange={(e) => setDates(d => ({ ...d, voteStart: e.target.value }))}
                className="w-full p-2 border-2 text-sm border-black rounded-lg neo-shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Voting End</label>
              <input
                type="datetime-local"
                value={dates.voteEnd}
                onChange={(e) => setDates(d => ({ ...d, voteEnd: e.target.value }))}
                className="w-full p-2 border-2 text-sm border-black rounded-lg neo-shadow-sm"
              />
            </div>
          </div>
          <NeoButton
            label="Execute Date Update"
            variant="secondary"
            fullWidth
            onClick={handleUpdateDates}
          />
        </div>
      )}
    </NeoModal>
  );
}
