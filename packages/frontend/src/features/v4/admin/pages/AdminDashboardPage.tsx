import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Navigate } from "@tanstack/react-router";
import { useAdminOverview, usePrograms, useApplicants, useScholars, Program } from "@/lib/api";
import { v4Addresses, scholarshipCoreAbi } from "@/constants/contractsV4";
import { parseAbi } from "viem";
import { NeoButton } from "@/components/ui/NeoButton";
import { AdminControlModal } from "../components/AdminControlModal";
import { AdminProtocolConfig } from "../components/AdminProtocolConfig";
import { formatUnits } from "viem";

export function AdminDashboardPage() {
  const { address } = useAccount();
  const { data: adminAddress, isLoading: isContractLoading } = useReadContract({
    address: v4Addresses.ScholarshipCore,
    abi: scholarshipCoreAbi,
    functionName: "admin",
  });

  const { data: overview, isLoading: isOverviewLoading } = useAdminOverview();
  const { data: programsData } = usePrograms({ limit: 100 });
  const { data: applicantsData } = useApplicants();
  const { data: scholarsData } = useScholars();

  // Treasury
  const { data: treasuryBalance } = useReadContract({
    address: v4Addresses.MockUSDC,
    abi: parseAbi(["function balanceOf(address) view returns (uint256)"]),
    functionName: "balanceOf",
    args: [v4Addresses.ScholarshipTreasury],
  });
  
  const { data: protocolFee } = useReadContract({
    address: v4Addresses.ScholarshipTreasury,
    abi: parseAbi(["function protocolFeeAccumulated() view returns (uint256)"]),
    functionName: "protocolFeeAccumulated",
  });

  const [activeTab, setActiveTab] = useState<"programs" | "users" | "treasury" | "config">("programs");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  if (isContractLoading || isOverviewLoading) {
    return <div className="p-8 text-center text-xl font-bold">Loading Admin Matrix...</div>;
  }

  const isAdmin = address && adminAddress && address.toLowerCase() === (adminAddress as string).toLowerCase();
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-5xl font-black mb-2 flex items-center gap-3">
            <span>🛠️</span> Protocol Admin
          </h1>
          <p className="text-gray-500 font-bold">Global oversight and matrix control.</p>
        </div>
      </div>

      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Programs" value={overview.totalPrograms} color="bg-blue-200" />
          <StatCard title="Creators" value={overview.totalCreators} color="bg-yellow-200" />
          <StatCard title="Applicants" value={overview.totalApplicants} color="bg-green-200" />
          <StatCard title="Scholars" value={overview.totalScholars} color="bg-skpurple text-white" />
          <StatCard title="Milestones" value={overview.totalMilestones} color="bg-orange-200" />
          <StatCard title="Disputes" value={overview.totalDisputes} color="bg-red-200" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b-4 border-black mb-6">
        <button 
          className={`py-3 px-6 font-black text-xl border-t-4 border-l-4 border-r-4 border-black rounded-t-xl transition-colors ${activeTab === 'programs' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
          onClick={() => setActiveTab("programs")}
        >
          Programs List
        </button>
        <button 
          className={`py-3 px-6 font-black text-xl border-t-4 border-l-4 border-r-4 border-black rounded-t-xl transition-colors ${activeTab === 'users' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
          onClick={() => setActiveTab("users")}
        >
          Users & Roles 
        </button>
        <button 
          className={`py-3 px-6 font-black text-xl border-t-4 border-l-4 border-r-4 border-black rounded-t-xl transition-colors ${activeTab === 'treasury' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
          onClick={() => setActiveTab("treasury")}
        >
          Treasury
        </button>
        <button 
          className={`py-3 px-6 font-black text-xl border-t-4 border-l-4 border-r-4 border-black rounded-t-xl transition-colors ${activeTab === 'config' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
          onClick={() => setActiveTab("config")}
        >
          Protocol Config
        </button>
      </div>

      {activeTab === "programs" && (
        <div className="bg-white border-4 border-black rounded-b-2xl rounded-tr-2xl neo-shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-4 border-black">
                  <th className="p-4 font-black border-r-2 border-black">ID</th>
                  <th className="p-4 font-black border-r-2 border-black">Status</th>
                  <th className="p-4 font-black border-r-2 border-black">Fund</th>
                  <th className="p-4 font-black border-r-2 border-black">Date Range</th>
                  <th className="p-4 font-black border-r-2 border-black">Initiator</th>
                  <th className="p-4 font-black text-center">Admin</th>
                </tr>
              </thead>
              <tbody>
                {programsData?.data.map((p) => (
                  <tr key={p.id} className="border-b-[1px] border-gray-300 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold border-r-2 border-black text-center">{p.blockchainId}</td>
                    <td className="p-4 font-bold border-r-2 border-black">
                      <span className="bg-black text-white px-2 py-1 rounded-md text-xs">{p.status}</span>
                    </td>
                    <td className="p-4 font-bold border-r-2 border-black">${formatUnits(BigInt(p.totalFund || "0"), 6)}</td>
                    <td className="p-4 text-xs font-bold border-r-2 border-black text-gray-600">
                      {new Date(p.applicationStart).toLocaleDateString()} -<br/>
                      {new Date(p.votingEnd).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-xs border-r-2 border-black text-blue-600 underline">
                      {p.initiator.slice(0,6)}...{p.initiator.slice(-4)}
                    </td>
                    <td className="p-4 text-center">
                      <NeoButton label="Override" variant="secondary" size="sm" onClick={() => setSelectedProgram(p)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-4 border-black rounded-2xl neo-shadow-sm overflow-hidden">
            <h2 className="text-xl font-black p-4 border-b-4 border-black bg-yellow-200">System Creators / Initiators</h2>
            <div className="overflow-y-auto max-h-[500px]">
              <table className="w-full text-left">
                <tbody>
                  {Array.from(new Set(programsData?.data.map(p => p.initiator) || [])).map((wallet, i) => (
                    <tr key={i} className="border-b-2 border-gray-200 text-sm">
                      <td className="p-3 font-bold">{wallet.slice(0,10)}...{wallet.slice(-8)}</td>
                      <td className="p-3">
                        <span className="bg-yellow-100 text-yellow-800 font-bold text-xs px-2 py-1 rounded border border-yellow-800">Has CORE_ROLE Authority</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white border-4 border-black rounded-2xl neo-shadow-sm overflow-hidden">
            <h2 className="text-xl font-black p-4 border-b-4 border-black bg-green-200">Global Applicants</h2>
            <div className="overflow-y-auto max-h-[500px]">
              <table className="w-full text-left">
                <tbody>
                  {applicantsData?.map((a, i) => (
                    <tr key={i} className="border-b-2 border-gray-200 text-sm">
                      <td className="p-3 font-bold">{a.applicant.wallet.slice(0,8)}...</td>
                      <td className="p-3 font-bold text-gray-500">Prog #{a.program?.blockchainId}</td>
                      <td className="p-3">
                        <span className="bg-black text-white text-xs px-2 py-1 rounded">{a.applicant.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white border-4 border-black rounded-2xl neo-shadow-sm overflow-hidden">
            <h2 className="text-xl font-black p-4 border-b-4 border-black bg-skpurple text-white">Global Scholars</h2>
            <div className="overflow-y-auto max-h-[500px]">
              <table className="w-full text-left">
                <tbody>
                  {scholarsData?.map((s, i) => (
                    <tr key={i} className="border-b-2 border-gray-200 text-sm">
                      <td className="p-3 font-bold">{s.scholar.wallet.slice(0,8)}...</td>
                      <td className="p-3 font-bold text-gray-500">Prog #{s.program?.blockchainId}</td>
                      <td className="p-3 font-bold text-green-600 border-l-2 pl-3">
                        ${formatUnits(BigInt(s.scholar.totalReceived || "0"), 6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "treasury" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#eef2ff] border-4 border-black rounded-2xl p-6 neo-shadow-sm">
            <h2 className="text-3xl font-black mb-6">Treasury Overview</h2>
            <div className="space-y-4">
              <div className="bg-white border-2 border-black p-4 rounded-xl flex justify-between items-center">
                <span className="font-bold text-gray-600 tracking-wider">TOTAL BACKING (USDC)</span>
                <span className="text-3xl font-black text-green-600">
                  ${treasuryBalance !== undefined ? formatUnits(treasuryBalance as bigint, 6) : "0.0"}
                </span>
              </div>
              <div className="bg-white border-2 border-black p-4 rounded-xl flex justify-between items-center">
                <span className="font-bold text-gray-600 tracking-wider">PROTOCOL REVENUE</span>
                <span className="text-2xl font-black text-blue-600">
                  ${protocolFee !== undefined ? formatUnits(protocolFee as bigint, 6) : "0.0"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#fff7ed] border-4 border-black rounded-2xl p-6 neo-shadow-sm">
            <h2 className="text-3xl font-black mb-6">Contract Registry</h2>
            <div className="space-y-3">
              <ContractItem label="ScholarshipCore" address={v4Addresses.ScholarshipCore} />
              <ContractItem label="TreasuryVault" address={v4Addresses.ScholarshipTreasury} />
              <ContractItem label="Bounty/Dispute" address={v4Addresses.ScholarshipBounty} />
              <ContractItem label="Reputation (NFT)" address={v4Addresses.ScholarshipReputation} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "config" && (
        <AdminProtocolConfig />
      )}

      {selectedProgram && (
        <AdminControlModal
          program={selectedProgram}
          isOpen={true}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className={`${color} border-2 border-black rounded-xl p-4 flex flex-col justify-center items-center shadow-[4px_4px_0px_rgba(0,0,0,1)]`}>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wider opacity-80">{title}</div>
    </div>
  );
}

function ContractItem({ label, address }: { label: string; address: string }) {
  return (
    <div className="flex justify-between items-center border-b-2 border-gray-300 pb-2">
      <span className="font-bold">{label}</span>
      <span className="bg-gray-100 text-gray-600 font-mono text-xs p-1 rounded border border-gray-300">
        {address.slice(0, 10)}...{address.slice(-8)}
      </span>
    </div>
  );
}
