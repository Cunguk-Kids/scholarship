/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { DonateModal } from '../components/DonateModal';
import { useParams, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  useProgram,
  useProgramApplicants,
  useProgramScholars,
  useProgramMilestones,
  useProgramVotes,
  useProgramDisputes,
} from '@/lib/api/hooks';
import { fetchProgramMeta } from '@/lib/ipfs';
import type { ProgramMetadata } from '@/lib/api/types';
import { NeoBadge } from '@/components/ui/NeoBadge';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard, NeoCardBody } from '@/components/ui/NeoCard';
import { PhaseTimeline } from '@/components/ui/PhaseTimeline';
import { StatCard } from '@/components/ui/StatCard';
import { WalletAvatar, shortenAddress } from '@/components/ui/WalletAvatar';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';

type Tab = 'overview' | 'applicants' | 'scholars' | 'milestones' | 'votes' | 'disputes';

const TABS: Array<{ key: Tab; label: string; icon: string }> = [
  { key: 'overview', label: 'Overview', icon: '📋' },
  { key: 'applicants', label: 'Applicants', icon: '📝' },
  { key: 'scholars', label: 'Scholars', icon: '🎓' },
  { key: 'milestones', label: 'Milestones', icon: '🏁' },
  { key: 'votes', label: 'Votes', icon: '🗳️' },
  { key: 'disputes', label: 'Disputes', icon: '⚖️' },
];

function formatUSDC(raw: string): string {
  const n = Number(raw) / 1e6;
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function ProgramDetailPage() {
  const { id } = useParams({ from: '/programs/$id/' });
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const { data: program, isLoading } = useProgram(id);
  const { data: meta } = useQuery({
    queryKey: ['ipfs-meta', program?.metadataCID],
    queryFn: () => fetchProgramMeta(program!.metadataCID),
    enabled: !!program?.metadataCID,
    staleTime: Infinity,
  });

  // Sub-resource queries (lazy loaded on tab switch)
  const applicantsQ = useProgramApplicants(activeTab === 'applicants' ? id : '');
  const scholarsQ = useProgramScholars(activeTab === 'scholars' ? id : '');
  const milestonesQ = useProgramMilestones(activeTab === 'milestones' ? id : '');
  const votesQ = useProgramVotes(activeTab === 'votes' ? id : '');
  const disputesQ = useProgramDisputes(activeTab === 'disputes' ? id : '');

  console.log(program?.status, '=====program====', program?.status === 'APPLICATION_OPEN');

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        <NeoSkeleton lines={3} />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <NeoSkeleton key={i} lines={2} />
          ))}
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h2 className="font-paytone text-2xl">Program not found</h2>
        <Link to="/programs" className="text-skpurple font-bold hover:underline mt-4 inline-block">
          ← Back to Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/programs" className="hover:text-skpurple font-bold">
          Programs
        </Link>
        <span>/</span>
        <span className="font-bold text-black">{meta?.name ?? `#${program.blockchainId}`}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-paytone text-3xl md:text-4xl">
              {meta?.name ?? `Program #${program.blockchainId}`}
            </h1>
            <NeoBadge status={program.status} />
          </div>
          {meta?.description && (
            <p className="text-gray-600 text-lg max-w-2xl">{meta.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <WalletAvatar address={program.initiator} size={20} />
            <span className="font-mono">{shortenAddress(program.initiator)}</span>
            {meta?.organization && <span>• {meta.organization}</span>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {program.status === 'APPLICATION_OPEN' && (
            <Link to="/apply/$id" params={{ id: program.id }}>
              <NeoButton label="Apply Now" variant="primary" size="md" />
            </Link>
          )}
          {program.status === 'VOTING' && (
            <Link to="/vote">
              <NeoButton label="Cast Vote" variant="primary" size="md" />
            </Link>
          )}
          <NeoButton
            label="Donate"
            variant="success"
            size="md"
            onClick={() => setIsDonateOpen(true)}
          />
        </div>
      </div>

      {isDonateOpen && (
        <DonateModal
          isOpen={isDonateOpen}
          onClose={() => setIsDonateOpen(false)}
          programId={program.blockchainId}
          programName={meta?.name}
        />
      )}

      {/* Phase timeline */}
      <NeoCard hoverable={false} className="p-6">
        <PhaseTimeline currentStatus={program.status} />
      </NeoCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Fund"
          value={`$${formatUSDC(program.totalFund)}`}
          icon="💰"
          color="green"
        />
        <StatCard
          label="Spent"
          value={`$${formatUSDC(program.spentFund)}`}
          icon="📤"
          color="orange"
        />
        <StatCard label="Applicants" value={program.applicantCount} icon="📝" color="yellow" />
        <StatCard
          label="Active Scholars"
          value={program.activeScholarCount}
          icon="🎓"
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-black pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-4 py-2 rounded-t-xl border-2 font-bold text-sm transition-all
              ${
                activeTab === tab.key
                  ? 'bg-white border-black border-b-white -mb-[3px] z-10'
                  : 'bg-gray-100 border-transparent hover:bg-gray-200'
              }
            `}>
            {tab.icon} {tab.label}
            {tab.key === 'applicants' && program._counts?.applicants
              ? ` (${program._counts.applicants})`
              : ''}
            {tab.key === 'scholars' && program._counts?.scholars
              ? ` (${program._counts.scholars})`
              : ''}
            {tab.key === 'disputes' && program._counts?.disputes
              ? ` (${program._counts.disputes})`
              : ''}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && <OverviewTab program={program} meta={meta ?? undefined} />}
        {activeTab === 'applicants' && (
          <ListTab
            data={applicantsQ.data}
            isLoading={applicantsQ.isLoading}
            renderItem={(a) => (
              <div key={a.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <WalletAvatar address={a.wallet} size={32} />
                  <div>
                    <p className="font-bold">{shortenAddress(a.wallet)}</p>
                    <p className="text-xs text-gray-500">
                      Retry #{a.retryCount} • Score: {a.totalScore || '—'}
                    </p>
                  </div>
                </div>
                <NeoBadge status={a.status} />
              </div>
            )}
          />
        )}
        {activeTab === 'scholars' && (
          <ListTab
            data={scholarsQ.data}
            isLoading={scholarsQ.isLoading}
            renderItem={(s) => (
              <div key={s.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <WalletAvatar address={s.wallet} size={32} />
                  <div>
                    <p className="font-bold">{shortenAddress(s.wallet)}</p>
                    <p className="text-xs text-gray-500">
                      Received: ${formatUSDC(s.totalReceived)} • Milestone {s.currentMilestone}/
                      {s.totalMilestones}
                    </p>
                  </div>
                </div>
                <NeoBadge status={s.status} />
              </div>
            )}
          />
        )}
        {activeTab === 'milestones' && (
          <ListTab
            data={milestonesQ.data}
            isLoading={milestonesQ.isLoading}
            renderItem={(m) => (
              <div key={m.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-bold">Milestone #{m.blockchainId}</p>
                  <p className="text-xs text-gray-500">
                    {shortenAddress(m.scholarWallet)} • ${formatUSDC(m.amount)}
                  </p>
                </div>
                <NeoBadge status={m.status} />
              </div>
            )}
          />
        )}
        {activeTab === 'votes' && (
          <ListTab
            data={votesQ.data}
            isLoading={votesQ.isLoading}
            renderItem={(v) => (
              <div key={v.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <WalletAvatar address={v.voterAddress} size={28} />
                  <div>
                    <p className="text-sm">
                      <span className="font-bold">{shortenAddress(v.voterAddress)}</span> voted for{' '}
                      <span className="font-bold text-skpurple">
                        {shortenAddress(v.candidateAddress)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">Weight: {v.votingWeight}</p>
                  </div>
                </div>
              </div>
            )}
          />
        )}
        {activeTab === 'disputes' && (
          <ListTab
            data={disputesQ.data}
            isLoading={disputesQ.isLoading}
            renderItem={(d) => (
              <div key={d.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-bold">
                    Dispute #{d.blockchainId}{' '}
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {d.disputeType}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    BH: {shortenAddress(d.bountyHunter)} vs {shortenAddress(d.scholarAddress)}
                  </p>
                </div>
                <NeoBadge status={d.status} />
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ program }: { program: any; meta?: ProgramMetadata }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NeoCard hoverable={false}>
        <NeoCardBody className="space-y-4">
          <h3 className="font-paytone text-lg">Program Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Max Candidates</dt>
              <dd className="font-bold">{program.maxCandidates}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Target Winners</dt>
              <dd className="font-bold">{program.targetWinners}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Screening Mode</dt>
              <dd className="font-bold">
                {program.screeningMode === 0 ? 'By Committee' : 'By Student'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Education Level</dt>
              <dd className="font-bold">
                {['SD', 'SMP', 'SMA', 'University'][program.educationLevel] ?? '—'}
              </dd>
            </div>
          </dl>
        </NeoCardBody>
      </NeoCard>

      <NeoCard hoverable={false}>
        <NeoCardBody className="space-y-4">
          <h3 className="font-paytone text-lg">Financial Summary</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Gross Total (incl. Fee)</dt>
              <dd className="font-bold">${formatUSDC(BigInt(program.totalFund) + BigInt(program.protocolFeeCollected || 0))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 text-skpurple font-bold">Net Total Fund</dt>
              <dd className="font-bold text-skpurple">${formatUSDC(program.totalFund)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
              <dt className="text-gray-500">Allocated</dt>
              <dd className="font-bold">${formatUSDC(program.allocatedFund)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Spent</dt>
              <dd className="font-bold text-orange-600">${formatUSDC(program.spentFund)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Yield Accrued</dt>
              <dd className="font-bold text-skblue">${formatUSDC(program.yieldAccrued)}</dd>
            </div>
          </dl>

          {/* Allocation Breakdown Bar */}
          <div className="pt-2">
            <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">Fund Allocation Breakdown</h4>
            <div className="flex h-5 w-full bg-gray-200 border-2 border-black overflow-hidden rounded-md cursor-help">
              <div
                className="h-full bg-skgreen transition-all"
                style={{ width: `${(Number(program.spentFund) / Math.max(1, Number(program.totalFund))) * 100}%` }}
                title={`Spent: $${formatUSDC(program.spentFund)}`}
              />
              <div
                className="h-full bg-skyellow transition-all"
                style={{ width: `${((Number(program.allocatedFund) - Number(program.spentFund)) / Math.max(1, Number(program.totalFund))) * 100}%` }}
                title={`Pending Allocation: $${formatUSDC(BigInt(program.allocatedFund) - BigInt(program.spentFund))}`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-600 mt-1 uppercase">
              <span className="text-green-700">Spent: {((Number(program.spentFund) / Math.max(1, Number(program.totalFund))) * 100).toFixed(1)}%</span>
              <span className="text-yellow-600">Pending: {(((Number(program.allocatedFund) - Number(program.spentFund)) / Math.max(1, Number(program.totalFund))) * 100).toFixed(1)}%</span>
              <span>Unallocated: {(((Number(program.totalFund) - Number(program.allocatedFund)) / Math.max(1, Number(program.totalFund))) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </NeoCardBody>
      </NeoCard>
    </div>
  );
}

function ListTab<T extends { id?: string }>({
  data,
  isLoading,
  renderItem,
}: {
  data: T[] | undefined;
  isLoading: boolean;
  renderItem: (item: T) => React.ReactNode;
}) {
  if (isLoading) return <NeoSkeleton lines={5} className="py-4" />;
  if (!data || data.length === 0) {
    return (
      <div className="neo-card p-8 text-center">
        <p className="text-4xl mb-2">📭</p>
        <p className="text-gray-500">No data yet</p>
      </div>
    );
  }
  return (
    <NeoCard hoverable={false}>
      <div className="divide-y-2 divide-gray-100">{data.map(renderItem)}</div>
    </NeoCard>
  );
}
