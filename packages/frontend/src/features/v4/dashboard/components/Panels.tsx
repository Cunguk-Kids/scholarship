import { Link } from '@tanstack/react-router';
import { formatUnits } from 'viem';
import { NeoCard, NeoCardBody } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { useSubmitMilestone, useClaimYield } from '@/lib/contracts/write-hooks';
import type { DashboardData, Program, Scholar } from '@/lib/api/types';

// ── Initiator ─────────────────────────────────────────────────────────────────

export function InitiatorPanel({ programs }: { programs: Program[] }) {
  const { claimYield, isPending } = useClaimYield();

  return (
    <section>
      <h2 className="font-paytone text-3xl mb-4 border-l-8 border-skpink pl-4 leading-none">
        Initiated Programs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((p) => (
          <NeoCard key={p.id}>
            <NeoCardBody>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Program #{p.id}</h3>
                  <p className="text-xs text-gray-500 uppercase">{p.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Yield Accrued</p>
                  <p className="font-paytone text-emerald-700">
                    {formatUnits(BigInt(p.yieldAccrued), 6)} USDC
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/programs/${p.id}`} className="flex-1">
                  <NeoButton label="View Program" variant="secondary" fullWidth />
                </Link>
                <NeoButton
                  label="Claim Yield"
                  variant="success"
                  loading={isPending}
                  disabled={BigInt(p.yieldAccrued) <= 0n && !isPending}
                  onClick={() => claimYield(BigInt(p.blockchainId))}
                />
              </div>
            </NeoCardBody>
          </NeoCard>
        ))}
      </div>
    </section>
  );
}

// ── Student ───────────────────────────────────────────────────────────────────

export function StudentPanel({
  scholarships,
  dashboardData,
}: {
  scholarships: Array<{ scholar: Scholar; program: Partial<Program> | null }>;
  dashboardData: DashboardData;
}) {
  const { submitMilestone, isPending } = useSubmitMilestone();

  return (
    <section>
      <h2 className="font-paytone text-3xl mb-4 border-l-8 border-skblue pl-4 leading-none">
        My Scholarships
      </h2>
      <div className="space-y-4">
        {scholarships.map(({ scholar, program }) => {
          // Find next pending milestone
          const myMilestones = dashboardData.milestones.filter((m) => m.scholarId === scholar.id);
          const nextMilestone = myMilestones.find((m) => m.status === 'PENDING');

          return (
            <NeoCard key={scholar.id}>
              <NeoCardBody className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Program #{scholar.programId}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Status: <span className="font-bold text-black">{scholar.status}</span>
                  </p>
                  <div className="bg-gray-100 p-2 rounded border border-black">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>
                        {scholar.currentMilestone} / {scholar.totalMilestones} Milestones
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden border border-black">
                      <div
                        className="h-full bg-skblue"
                        style={{
                          width: `${(scholar.currentMilestone / scholar.totalMilestones) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  {scholar.status === 'FROZEN' ? (
                    <div className="bg-red-100 p-2 border-2 border-red-500 rounded text-red-700 text-sm font-bold text-center">
                      Account Frozen until{' '}
                      {new Date(Number(scholar.freezeUntil) * 1000).toLocaleDateString()}
                    </div>
                  ) : nextMilestone ? (
                    <NeoButton
                      label={`Submit Milestone #${nextMilestone.blockchainId}`}
                      variant="primary"
                      onClick={() => {
                        // Demo: submits dummy CID for next milestone
                        submitMilestone(BigInt(nextMilestone.blockchainId), 'QmSubmitDemo123');
                      }}
                      loading={isPending}
                      disabled={isPending}
                      fullWidth
                    />
                  ) : (
                    <NeoButton label="All Milestones Complete" variant="ghost" disabled fullWidth />
                  )}
                </div>
              </NeoCardBody>
            </NeoCard>
          );
        })}
      </div>
    </section>
  );
}

// ── Voter ─────────────────────────────────────────────────────────────────────

export function VoterPanel({
  votes,
  stakes,
  dashboardData,
}: {
  votes: DashboardData['votes'];
  stakes: DashboardData['stakes'];
  dashboardData: DashboardData;
}) {
  return (
    <section>
      <h2 className="font-paytone text-3xl mb-4 border-l-8 border-skpurple pl-4 leading-none">
        Voter Activity
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Votes */}
        <NeoCard>
          <NeoCardBody>
            <h3 className="font-bold mb-4">Cast Votes ({votes.length})</h3>
            {votes.length === 0 ? (
              <p className="text-gray-500 text-sm">No votes cast.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {votes.slice(0, 5).map((v) => (
                  <li key={v.id} className="flex justify-between border-b border-gray-200 pb-1">
                    <span>Prog #{v.programId}</span>
                    <span className="font-mono">{v.candidateAddress.slice(0, 6)}...</span>
                  </li>
                ))}
              </ul>
            )}
          </NeoCardBody>
        </NeoCard>

        {/* Stakes */}
        <NeoCard>
          <NeoCardBody>
            <h3 className="font-bold mb-4">Confidence Stakes ({stakes.length})</h3>
            {stakes.length === 0 ? (
              <p className="text-gray-500 text-sm">No stakes placed.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stakes.map((s) => (
                  <li key={s.id} className="flex justify-between border-b border-gray-200 pb-1">
                    <span>Prog #{s.programId}</span>
                    <span
                      className={
                        s.isResolved
                          ? s.wasSlashed
                            ? 'text-skred'
                            : 'text-skgreen'
                          : 'text-skyellow'
                      }>
                      {formatUnits(BigInt(s.amount), 6)} USDC
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </NeoCardBody>
        </NeoCard>
      </div>
    </section>
  );
}

// ── Bounty Hunter ─────────────────────────────────────────────────────────────

export function BountyHunterPanel({
  disputes,
  dashboardData,
}: {
  disputes: DashboardData['disputes'];
  dashboardData: DashboardData;
}) {
  return (
    <section>
      <h2 className="font-paytone text-3xl mb-4 border-l-8 border-skgreen pl-4 leading-none">
        Bounty Hunter Activity
      </h2>
      {disputes.length === 0 ? (
        <p className="text-gray-500">No disputes raised yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disputes.map((d) => (
            <NeoCard key={d.id}>
              <NeoCardBody>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">Milestone #{d.milestoneId}</h3>
                    <p className="text-xs text-gray-500 font-mono">
                      Target: {d.scholarAddress.slice(0, 6)}...
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 border-2 border-black rounded text-[10px] font-bold uppercase ${
                      d.status === 'ACTIVE'
                        ? 'bg-skyellow text-black'
                        : d.status.includes('WON') ||
                            d.status.includes('GUILTY') ||
                            d.status.includes('CONCEDED')
                          ? 'bg-skgreen text-black'
                          : 'bg-skred text-white'
                    }`}>
                    {d.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-4 pt-2 border-t border-gray-200">
                  <span className="text-gray-500">Reward Paid:</span>
                  <span className="font-bold font-paytone">
                    {formatUnits(BigInt(d.bhRewardPaid), 6)} USDC
                  </span>
                </div>
              </NeoCardBody>
            </NeoCard>
          ))}
        </div>
      )}
    </section>
  );
}
