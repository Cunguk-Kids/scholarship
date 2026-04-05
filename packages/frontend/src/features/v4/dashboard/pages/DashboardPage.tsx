import { useAccount } from 'wagmi';
import { useDashboard } from '@/lib/api/hooks';
import { NeoCard, NeoCardBody } from '@/components/ui/NeoCard';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { StatCard } from '@/components/ui/StatCard';
import { formatUnits } from 'viem';

import {
  InitiatorPanel,
  StudentPanel,
  VoterPanel,
  BountyHunterPanel,
  CommitteePanel,
} from '../components/Panels';
import { CreateProgramModal } from '../../programs/components/CreateProgramModal';
import { useState, useMemo } from 'react';
import { NeoButton } from '@/components/ui/NeoButton';

export function DashboardPage() {
  const { address } = useAccount();
  const { data: dashboard, isLoading } = useDashboard(address || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ── Committee membership detection ───────────────────────────────────────────
  // Use DB-backed data from Ponder (committeePrograms) — this covers ALL programs
  // where the wallet is an active member, not just programs the user created.
  const committeePrograms = dashboard?.committeePrograms ?? [];
  const committeeProgramIds = useMemo(
    () => committeePrograms.map((p) => p.blockchainId),
    [committeePrograms],
  );

  // ── Role detection ────────────────────────────────────────────────────────────
  if (!address) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-6xl mb-4">🔌</p>
        <h1 className="font-paytone text-4xl mb-4">Connect Wallet</h1>
        <p className="text-gray-600">Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-12 max-w-5xl mx-auto">
        <NeoSkeleton lines={8} />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-6xl mb-4">📭</p>
        <h1 className="font-paytone text-4xl mb-4">No Data</h1>
        <p className="text-gray-600">No dashboard data found for this wallet.</p>
      </div>
    );
  }

  const { summary, programsCreated, scholarships, votes, stakes, disputes, reputation } = dashboard;

  const roles: string[] = [];
  if (programsCreated.length > 0) roles.push('INITIATOR');
  if (scholarships.length > 0) roles.push('SCHOLAR');
  if (votes.length > 0 || stakes.length > 0) roles.push('VOTER');
  if (disputes.length > 0) roles.push('BOUNTY_HUNTER');
  if (committeeProgramIds.length > 0) roles.push('COMMITTEE');

  const roleColors: Record<string, string> = {
    INITIATOR: 'bg-skpink-light',
    SCHOLAR: 'bg-skblue-light',
    VOTER: 'bg-skpurple-light',
    BOUNTY_HUNTER: 'bg-skgreen-light',
    COMMITTEE: 'bg-skyellow-light',
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h1 className="font-paytone text-5xl mb-2">My Dashboard</h1>
            <p className="text-gray-600 text-lg font-mono">{address}</p>
          </div>
          <NeoButton
            label="Create Program"
            variant="primary"
            size="lg"
            onClick={() => setIsCreateModalOpen(true)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {roles.map((r) => (
            <span
              key={r}
              className={`px-3 py-1 ${roleColors[r] ?? 'bg-gray-100'} border-2 border-black rounded-lg text-xs font-bold uppercase`}
            >
              {r.replace('_', ' ')}
            </span>
          ))}
          {roles.length === 0 && (
            <span className="px-3 py-1 bg-gray-100 border-2 border-black rounded-lg text-xs font-bold uppercase">
              NEWCOMER
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard
          icon="🏆"
          label="Reputation"
          value={
            reputation
              ? Number(formatUnits(BigInt(reputation.repBalance), 18)).toFixed(2)
              : '0'
          }
        />
        <StatCard icon="🎓" label="Scholarships" value={summary.scholarshipsCount.toString()} />
        <StatCard icon="🗳️" label="Votes Cast" value={summary.votesCount.toString()} />
        <StatCard icon="⚖️" label="Disputes" value={summary.disputesCount.toString()} />
      </div>

      {/* Role Panels */}
      <div className="space-y-12">
        <InitiatorPanel 
          programs={programsCreated} 
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        <StudentPanel scholarships={scholarships} dashboardData={dashboard} />

        <VoterPanel votes={votes} stakes={stakes} dashboardData={dashboard} />

        <BountyHunterPanel disputes={disputes} dashboardData={dashboard} />

        <CommitteePanel
          programIds={committeeProgramIds}
          dashboardData={dashboard}
          address={address}
        />
      </div>

      <CreateProgramModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
