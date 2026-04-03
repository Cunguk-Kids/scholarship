import { useState, useEffect } from "react";
import { uploadToIPFS } from "@/lib/ipfs";
import { useCreateProgram, useApproveUSDC } from "@/lib/contracts/write-hooks";
import { NeoModal } from "@/components/ui/NeoModal";
import { NeoButton } from "@/components/ui/NeoButton";
import type { ProgramMetadata } from "@/lib/api/types";
import { v4Addresses } from "@/constants/contractsV4";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProgramModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<"form" | "upload" | "approve" | "create">("form");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    organization: "",
    targetWinners: 1,
    maxCandidates: 5,
    totalFund: "100",
    educationLevel: 3, // 3 = University
  });

  const { approve, isPending: isApproving, isSuccess: approved } = useApproveUSDC();
  const { create, isPending: isCreating, isSuccess: created } = useCreateProgram();
  const [metaCID, setMetaCID] = useState("");

  const handleNext = async () => {
    if (step === "form") {
      setStep("upload");
      // 1. Upload to IPFS
      const meta: ProgramMetadata = {
        name: formData.name,
        description: formData.description,
        organization: formData.organization,
      };
      const res = await uploadToIPFS({ meta });
      // If backend IPFS is not ready, we use a fallback CID for testing
      const cid = res?.metaCID || "QmFallbackTestingCID1234567890abcdefg";
      setMetaCID(cid);
      setStep("approve");
    } else if (step === "approve") {
      // 2. Approve USDC
      approve(v4Addresses.ScholarshipCore, formData.totalFund);
    } else if (step === "create") {
      // 3. Create Contract
      const now = BigInt(Math.floor(Date.now() / 1000));
      const appStart  = now;
      const appEnd    = now + 7n * 86400n;
      const voteStart = appEnd + 3600n;          // 1h gap — contract requires appEnd < voteStart
      const voteEnd   = voteStart + 7n * 86400n;

      create({
        metadataCID: metaCID,
        educationLevel: formData.educationLevel,
        screeningMode: 1, // 1 = BY_STUDENT
        weights: { academicWeight: 40, incomeWeight: 40, essayWeight: 0, recommendWeight: 20, extracurricWeight: 0 },
        slashDist: { bountyHunterPercent: 50, treasuryPercent: 30, protocolPercent: 20 },
        maxCandidates: formData.maxCandidates,
        targetWinners: formData.targetWinners,
        timeline: [appStart, appEnd, voteStart, voteEnd],
        milestoneDisputeWindow: 7n * 86400n, // 7 days
        totalFund: formData.totalFund,
        committeeContract: "0x0000000000000000000000000000000000000000",
      });
    }
  };

  useEffect(() => {
    if (approved && step === "approve") {
      setStep("create");
    }
  }, [approved, step]);

  if (created) {
    return (
      <NeoModal isOpen={isOpen} onClose={onClose} title="Success!">
        <div className="text-center py-8">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-2xl font-paytone mb-2">Program Created!</h2>
          <p className="text-gray-600 mb-6">Your scholarship program is now on-chain.</p>
          <NeoButton label="View Program" onClick={onClose} fullWidth />
        </div>
      </NeoModal>
    );
  }

  return (
    <NeoModal isOpen={isOpen} onClose={onClose} title="Create Scholarship Program">
      <div className="space-y-4">
        {step === "form" && (
          <>
            <div>
              <label className="block text-sm font-bold mb-1">Program Name</label>
              <input 
                type="text" 
                className="w-full border-2 border-black p-2 rounded-lg neo-shadow-sm focus:outline-skpurple"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Description</label>
              <textarea 
                className="w-full border-2 border-black p-2 rounded-lg neo-shadow-sm focus:outline-skpurple"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Total Fund (USDC)</label>
                <input 
                  type="number" 
                  className="w-full border-2 border-black p-2 rounded-lg neo-shadow-sm focus:outline-skpurple"
                  value={formData.totalFund}
                  onChange={(e) => setFormData(p => ({ ...p, totalFund: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Target Winners</label>
                <input 
                  type="number" 
                  className="w-full border-2 border-black p-2 rounded-lg neo-shadow-sm focus:outline-skpurple"
                  value={formData.targetWinners}
                  onChange={(e) => setFormData(p => ({ ...p, targetWinners: Number(e.target.value) }))}
                />
              </div>
            </div>
          </>
        )}

        {step === "upload" && (
          <div className="text-center py-12">
            <p className="animate-spin text-4xl mb-4">⏳</p>
            <p className="font-bold">Uploading Metadata to IPFS...</p>
          </div>
        )}

        {step === "approve" && (
          <div className="text-center py-12 space-y-4">
            <p className="text-4xl mb-4">💰</p>
            <p className="font-bold">Approve USDC</p>
            <p className="text-sm text-gray-600">You need to approve the Treasury contract to transfer {formData.totalFund} USDC.</p>
          </div>
        )}

        {step === "create" && (
          <div className="text-center py-12 space-y-4">
            <p className="text-4xl mb-4">📝</p>
            <p className="font-bold">Sign Contract Transaction</p>
            <p className="text-sm text-gray-600">Please confirm the transaction in your wallet.</p>
          </div>
        )}

        <div className="pt-4 border-t-2 border-gray-100 flex justify-end gap-2">
          <NeoButton label="Cancel" variant="ghost" onClick={onClose} disabled={isApproving || isCreating} />
          {step === "form" && (
            <NeoButton label="Continue" variant="primary" onClick={handleNext} disabled={!formData.name || !formData.totalFund} />
          )}
          {step === "approve" && (
            <NeoButton label={isApproving ? "Approving..." : "Approve USDC"} variant="primary" onClick={handleNext} disabled={isApproving} loading={isApproving} />
          )}
          {step === "create" && (
            <NeoButton label={isCreating ? "Creating..." : "Create Program"} variant="success" onClick={handleNext} disabled={isCreating} loading={isCreating} />
          )}
        </div>
      </div>
    </NeoModal>
  );
}
