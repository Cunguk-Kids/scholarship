import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { StatusBadge } from "./StatusBadge";

type MilestoneStatus = "disbursed" | "pending" | "locked";

interface Milestone {
  id: number;
  title: string;
  amount: string;
  status: MilestoneStatus;
  isActive?: boolean;
}

const MilestoneProgress = ({ milestones }: { milestones: Milestone[] }) => {
  const [reflections, setReflections] = useState<string>();
  const [uploads, setUploads] = useState<File | null>();

  const handleReflectionChange = (value: string) => {
    setReflections(() => value);
  };

  const handleUpload = (file: File) => {
    setUploads(() => file);
  };

  return (
    <div className="w-full bg-skbw rounded-xl overflow-hidden p-4 space-y-6">
      {milestones.map((milestone, index) => (
        <div key={milestone.id} className="relative">
          {/* Header Row */}
          <div className="flex items-center space-x-4 mb-2 relative z-10">
            {/* Status Dot */}
            <div className="flex flex-col items-center w-6">
              {milestone.status === "disbursed" && (
                <img
                  src="/icons/milestone-success.svg"
                  alt="milestone-success"
                />
              )}
              {milestone.status === "pending" && (
                <img
                  src="/icons/milestone-pending.svg"
                  alt="milestone-pending"
                />
              )}
              {milestone.status === "locked" && (
                <div className="w-3.5 h-3.5 rounded-full bg-[#d9d9d9] border border-gray-400" />
              )}
            </div>

            {/* Text and Amount */}
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-6 items-center">
                <div className="font-medium text-sm">
                  Milestone #{milestone.id}
                </div>
                <div className="w-48 text-lg font-bold">{milestone.title}</div>
              </div>
              <div className="">
                <div className="font-semibold text-lg">{milestone.amount}</div>
              </div>
              <div className="justify-end">
                {milestone.status === "locked" ? (
                  <div className="text-xs text-blue-700 flex items-center">
                    🔒 Locked until Milestone {milestone.id - 1} approved
                  </div>
                ) : (
                  <StatusBadge size="small" status={milestone.status} />
                )}
              </div>
            </div>
          </div>

          {/* Vertical Line */}
          {index < milestones.length && milestone.status !== "locked" && (
            <div
              className={`absolute ${milestone.isActive ? "h-[calc(100%+4rem)]" : "h-16"} -bottom-10 left-2.5 w-1 ${index === 0 ? "z-1" : "-z-[index]"} ${
                milestone.status === "disbursed" ? "bg-skgreen" : "bg-[#d9d9d9]"
              }`}
            />
          )}

          {/* Active Form for Pending Milestone */}
          {milestone.status === "pending" && milestone.isActive && (
            <div className="gap-8">
              <div className="flex flex-col p-4 ml-10 border rounded-2xl bg-white self-stretch gap-4 items-start">
                {/* Bagian 1: Deskripsi Penggunaan Dana */}
                <Input
                  type="text"
                  value={reflections || ""}
                  onChange={handleReflectionChange}
                />

                {/* Divider */}
                <div className="border-t h-1 self-stretch border-gray-200"></div>

                {/* Bagian 2: Upload Bukti */}
                <div className="flex items-center gap-2.5 self-stretch w-full">
                  <img src="/icons/upload-square.svg" alt="upload-icon" />
                  <p className="text-sm text-center font-medium">
                    Upload invoice, receipts, or a short explanation of how the
                    fund was used.
                  </p>
                </div>
                <Input type="upload" onUpload={handleUpload} />
              </div>
              {/* Submit Button (kanan bawah) */}
              <div className="flex justify-end p-">
                <Button label="Submit" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MilestoneProgress;
