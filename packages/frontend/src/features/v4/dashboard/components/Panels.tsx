import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { formatUnits } from 'viem';
import { NeoCard, NeoCardBody } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import {
  useOpenApplications,
  useOpenScreening,
  useCancelProgram,
  useClaimYield,
  useSubmitMilestone,
  useExecuteMilestone,
  useTriggerAutoGuilty,
  useVoteOnDispute,
  useVoteOnMilestone,
} from '@/lib/contracts/write-hooks';
import type {
  DashboardData,
  Program,
  Scholar,
  Dispute,
  Milestone,
  Applicant,
} from '@/lib/api/types';
import { formatCurrency, formatUSDC } from '@/util/currency';
import { useProgramApplicants, useProgramMilestones } from '@/lib/api/hooks';

import { CommitteeManagementModal } from '../../programs/components/CommitteeManagementModal';
import { ResolveShortlistModal } from '../../programs/components/ResolveShortlistModal';
import { SelectWinnersModal } from '../../programs/components/SelectWinnersModal';
import { ProposeMilestoneModal } from './ProposeMilestoneModal';
import { CommitteeScoreModal } from './CommitteeScoreModal';

// ─────────────────────────────────────────────────────────────────────────────
// Initiator Panel
// ─────────────────────────────────────────────────────────────────────────────

export function InitiatorPanel({ programs }: { programs: Program[] }) {
  const [manageCommitteeFor, setManageCommitteeFor] = useState<number | null>(null);
  const [resolveShortlistFor, setResolveShortlistFor] = useState<Program | null>(null);
  const [selectWinnersFor, setSelectWinnersFor] = useState<Program | null>(null);

  return (
    <section>
      <h2 className="font-paytone text-3xl mb-4 border-l-8 border-skpink pl-4 leading-none">
        Initiated Programs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((p) => (
          <InitiatorProgramCard
            key={p.id}
            program={p}
            onManageCommittee={() => setManageCommitteeFor(p.blockchainId)}
            onResolveShortlist={() => setResolveShortlistFor(p)}
            onSelectWinners={() => setSelectWinnersFor(p)}
          />
        ))}
      </div>

      {manageCommitteeFor !== null && (
        <CommitteeManagementModal
          isOpen
          onClose={() => setManageCommitteeFor(null)}
          programId={manageCommitteeFor}
        />
      )}

      {resolveShortlistFor && (
        <ResolveShortlistForProgram
          program={resolveShortlistFor}
          onClose={() => setResolveShortlistFor(null)}
        />
      )}

      {selectWinnersFor && (
        <SelectWinnersForProgram
          program={selectWinnersFor}
          onClose={() => setSelectWinnersFor(null)}
        />
      )}
    </section>
  );
}

function ResolveShortlistForProgram({
  program,
  onClose,
}: {
  program: Program;
  onClose: () => void;
}) {
  const { data: applicants = [] } = useProgramApplicants(program.id);
  return (
    <ResolveShortlistModal
      isOpen
      onClose={onClose}
      programId={program.blockchainId}
      applicants={applicants}
    />
  );
}

function SelectWinnersForProgram({ program, onClose }: { program: Program; onClose: () => void }) {
  const { data: applicants = [] } = useProgramApplicants(program.id);
  const shortlisted = applicants.filter((a) => a.status === 'SHORTLISTED');
  return (
    <SelectWinnersModal
      isOpen
      onClose={onClose}
      programId={program.blockchainId}
      shortlisted={shortlisted}
      targetWinners={program.targetWinners}
    />
  );
}

function InitiatorProgramCard({
  program,
  onManageCommittee,
  onResolveShortlist,
  onSelectWinners,
}: {
  program: Program;
  onManageCommittee: () => void;
  onResolveShortlist: () => void;
  onSelectWinners: () => void;
}) {
  const { openApplications, isPending: openingApps } = useOpenApplications();
  const { openScreening, isPending: openingScreen } = useOpenScreening();
  const { cancelProgram, isPending: cancelling } = useCancelProgram();
  const { claimYield, isPending: claiming } = useClaimYield();

  const isFinal = ['COMPLETED', 'CANCELLED'].includes(program.status);

  return (
    <NeoCard>
      <NeoCardBody>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">Program #{program.blockchainId}</h3>
            <p className="text-xs text-gray-500 uppercase font-bold">
              {program.status.replace('_', ' ')}
            </p>
            <p className="text-sm mt-1">
              {formatCurrency(formatUSDC(Number(program.totalFund)), 'USD')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Yield Accrued</p>
            <p className="font-paytone text-emerald-700">
              {formatUnits(BigInt(program.yieldAccrued), 6)} USDC
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link to="/programs/$id" params={{ id: program.id }} className="col-span-2">
            <NeoButton label="View Program" variant="secondary" fullWidth />
          </Link>

          {program.status === 'CREATED' && (
            <div className="col-span-2">
              <NeoButton
                label={openingApps ? 'Opening…' : 'Open Applications'}
                variant="primary"
                fullWidth
                loading={openingApps}
                disabled={openingApps}
                onClick={() => openApplications(BigInt(program.blockchainId))}
              />
            </div>
          )}

          {program.status === 'APPLICATION_OPEN' && (
            <div className="col-span-2">
              <NeoButton
                label={openingScreen ? 'Opening…' : 'Open Screening'}
                variant="primary"
                fullWidth
                loading={openingScreen}
                disabled={openingScreen}
                onClick={() => openScreening(BigInt(program.blockchainId))}
              />
            </div>
          )}

          {program.status === 'SCREENING' && (
            <div className="col-span-2">
              <NeoButton
                label="Resolve Shortlist"
                variant="primary"
                fullWidth
                onClick={onResolveShortlist}
              />
            </div>
          )}

          {program.status === 'VOTING' && (
            <div className="col-span-2">
              <NeoButton
                label="Select Winners"
                variant="success"
                fullWidth
                onClick={onSelectWinners}
              />
            </div>
          )}

          {!isFinal && (
            <NeoButton
              label="🏛 Committee"
              variant="secondary"
              fullWidth
              onClick={onManageCommittee}
            />
          )}

          {program.status === 'COMPLETED' && BigInt(program.yieldAccrued) > 0n && (
            <NeoButton
              label={claiming ? 'Claiming…' : 'Claim Yield'}
              variant="success"
              fullWidth
              loading={claiming}
              disabled={claiming}
              onClick={() =>
                claimYield(
                  BigInt(program.blockchainId),
                  '0x0000000000000000000000000000000000000000',
                )
              }
            />
          )}

          {!isFinal && (
            <NeoButton
              label={cancelling ? 'Cancelling…' : 'Cancel'}
              variant="danger"
              fullWidth
              loading={cancelling}
              disabled={cancelling}
              onClick={() => cancelProgram(BigInt(program.blockchainId))}
            />
          )}
        </div>
      </NeoCardBody>
    </NeoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Student Panel
// ─────────────────────────────────────────────────────────────────────────────

export function StudentPanel({
  scholarships,
  dashboardData,
}: {
  scholarships: Array<{ scholar: Scholar; program: Partial<Program> | null }>;
  dashboardData: DashboardData;
}) {
  const [proposeMilestoneFor, setProposeMilestoneFor] = useState<number | null>(null);

  return (
    <section>
      <h2 className="font-paytone text-3xl mb-4 border-l-8 border-skblue pl-4 leading-none">
        My Scholarships
      </h2>
      <div className="space-y-4">
        {scholarships.map(({ scholar }) => {
          const myMilestones = dashboardData.milestones.filter((m) => m.scholarId === scholar.id);
          return (
            <ScholarCard
              key={scholar.id}
              scholar={scholar}
              milestones={myMilestones}
              onProposeMilestone={() => setProposeMilestoneFor(scholar.blockchainProgramId)}
            />
          );
        })}
      </div>

      {proposeMilestoneFor !== null && (
        <ProposeMilestoneModal
          isOpen
          onClose={() => setProposeMilestoneFor(null)}
          programId={proposeMilestoneFor}
        />
      )}
    </section>
  );
}

function ScholarCard({
  scholar,
  milestones,
  onProposeMilestone,
}: {
  scholar: Scholar;
  milestones: Milestone[];
  onProposeMilestone: () => void;
}) {
  const { submitMilestone, isPending: isSubmitting } = useSubmitMilestone();
  const { executeMilestone, isPending: isExecuting } = useExecuteMilestone();

  const nextPending = milestones.find((m) => m.status === 'PENDING');
  const executables = milestones.filter(
    (m) =>
      m.status === 'SUBMITTED' &&
      m.disputeDeadline &&
      new Date(m.disputeDeadline).getTime() < Date.now(),
  );

  return (
    <NeoCard>
      <NeoCardBody className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg">Program #{scholar.blockchainProgramId}</h3>
            <p className="text-xs text-gray-500 mb-2">
              Status: <span className="font-bold text-black">{scholar.status}</span>
            </p>
            <div className="bg-gray-100 p-2 rounded border border-black">
              <div className="flex justify-between text-xs mb-1">
                <span>Milestone Progress</span>
                <span>
                  {scholar.currentMilestone} / {scholar.totalMilestones}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden border border-black">
                <div
                  className="h-full bg-skblue transition-all"
                  style={{
                    width: `${(scholar.currentMilestone / Math.max(1, scholar.totalMilestones)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-52">
            {scholar.status === 'FROZEN' ? (
              <div className="bg-red-100 p-2 border-2 border-red-500 rounded text-red-700 text-sm font-bold text-center">
                ❄️ Frozen until{' '}
                {scholar.freezeUntil ? new Date(scholar.freezeUntil).toLocaleDateString() : '—'}
              </div>
            ) : nextPending ? (
              <NeoButton
                label={
                  isSubmitting ? 'Submitting…' : `Submit Milestone #${nextPending.blockchainId}`
                }
                variant="primary"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
                onClick={() => submitMilestone(BigInt(nextPending.blockchainId), 'QmProofCID')}
              />
            ) : (
              <NeoButton label="All Milestones Done ✓" variant="ghost" disabled fullWidth />
            )}

            {executables.map((m) => (
              <NeoButton
                key={m.id}
                label={isExecuting ? 'Executing…' : `Execute #${m.blockchainId}`}
                variant="success"
                size="sm"
                fullWidth
                loading={isExecuting}
                disabled={isExecuting}
                onClick={() => executeMilestone(BigInt(m.blockchainId))}
              />
            ))}

            {scholar.status === 'ACTIVE' && (
              <NeoButton
                label="+ Propose Milestone"
                variant="ghost"
                size="sm"
                fullWidth
                onClick={onProposeMilestone}
              />
            )}
          </div>
        </div>

        {milestones.length > 0 && (
          <div className="border-t-2 border-gray-100 pt-3">
            <p className="text-xs font-bold uppercase text-gray-500 mb-2">Milestones</p>
            <div className="space-y-1">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  <div>
                    <span className="font-bold">#{m.blockchainId}</span>
                    <span className="text-gray-500 ml-2">
                      ${formatUnits(BigInt(m.amount), 6)} USDC
                    </span>
                  </div>
                  <StatusPill status={m.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </NeoCardBody>
    </NeoCard>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-skyellow text-black',
    SUBMITTED: 'bg-skblue text-white',
    COMPLETED: 'bg-skgreen text-black',
    FROZEN: 'bg-skred text-white',
    DISPUTED: 'bg-orange-400 text-white',
    PROPOSED: 'bg-skpurple-light text-black',
    REJECTED: 'bg-gray-300 text-black',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-black ${
        colors[status] ?? 'bg-gray-100 text-black'
      }`}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Voter Panel
// ─────────────────────────────────────────────────────────────────────────────

export function VoterPanel({
  votes,
  stakes,
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
                    <span className="font-mono">{v.candidateAddress.slice(0, 6)}…</span>
                  </li>
                ))}
              </ul>
            )}
          </NeoCardBody>
        </NeoCard>

        <NeoCard>
          <NeoCardBody>
            <h3 className="font-bold mb-4">Confidence Stakes ({stakes.length})</h3>
            {stakes.length === 0 ? (
              <p className="text-gray-500 text-sm">No stakes placed.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stakes.map((s) => (
                  <li key={s.id} className="flex justify-between border-b border-gray-200 pb-1">
                    <span>Prog #{s.blockchainProgramId}</span>
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

// ─────────────────────────────────────────────────────────────────────────────
// Bounty Hunter Panel
// ─────────────────────────────────────────────────────────────────────────────

export function BountyHunterPanel({
  disputes,
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
            <BountyDisputeCard key={d.id} dispute={d} />
          ))}
        </div>
      )}
    </section>
  );
}

function BountyDisputeCard({ dispute }: { dispute: Dispute }) {
  const { triggerAutoGuilty, isPending: triggering } = useTriggerAutoGuilty();

  const now = Date.now();
  const defenseDeadlinePassed =
    dispute.defenseDeadline !== null && new Date(dispute.defenseDeadline).getTime() < now;
  const noCounterEvidence = !dispute.counterEvidenceCID;
  const canAutoGuilty = dispute.status === 'ACTIVE' && defenseDeadlinePassed && noCounterEvidence;

  return (
    <NeoCard>
      <NeoCardBody>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold">Dispute #{dispute.blockchainId}</h3>
            <p className="text-xs text-gray-500 font-mono">
              Target: {dispute.scholarAddress.slice(0, 6)}…
            </p>
          </div>
          <span
            className={`px-2 py-0.5 border-2 border-black rounded text-[10px] font-bold uppercase ${
              dispute.status === 'ACTIVE'
                ? 'bg-skyellow text-black'
                : dispute.status.includes('WON') ||
                    dispute.status.includes('GUILTY') ||
                    dispute.status.includes('CONCEDED')
                  ? 'bg-skgreen text-black'
                  : 'bg-skred text-white'
            }`}>
            {dispute.status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200 mb-3">
          <span className="text-gray-500">Reward Paid:</span>
          <span className="font-bold font-paytone">
            {formatUnits(BigInt(dispute.bhRewardPaid), 6)} USDC
          </span>
        </div>

        {canAutoGuilty && (
          <NeoButton
            label={triggering ? 'Triggering…' : '⚡ Trigger Auto-Guilty'}
            variant="danger"
            size="sm"
            fullWidth
            loading={triggering}
            disabled={triggering}
            onClick={() => triggerAutoGuilty(BigInt(dispute.blockchainId))}
          />
        )}

        {dispute.status === 'ACTIVE' && !defenseDeadlinePassed && dispute.defenseDeadline && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Defense deadline: {new Date(dispute.defenseDeadline).toLocaleDateString()}
          </p>
        )}
      </NeoCardBody>
    </NeoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Committee Panel
// ─────────────────────────────────────────────────────────────────────────────

export function CommitteePanel({
  programIds,
  dashboardData,
}: {
  programIds: number[];
  dashboardData: DashboardData;
  address: string;
}) {
  return (
    <section>
      <h2 className="font-paytone text-3xl mb-4 border-l-8 border-skblue pl-4 leading-none">
        Committee Duties
      </h2>
      <div className="space-y-4">
        {programIds.map((pid) => (
          <CommitteeProgramSection key={pid} programId={pid} dashboardData={dashboardData} />
        ))}
      </div>
    </section>
  );
}

function CommitteeProgramSection({
  programId,
  dashboardData,
}: {
  programId: number;
  dashboardData: DashboardData;
}) {
  const programRecord = dashboardData.programsCreated.find((p) => p.blockchainId === programId);
  const { data: allApplicants = [] } = useProgramApplicants(programRecord?.id ?? '');
  const { data: allMilestones = [] } = useProgramMilestones(programRecord?.id ?? '');

  const pendingApplicants = allApplicants.filter((a) => a.status === 'PENDING_REVIEW');
  const proposedMilestones = allMilestones.filter((m) => m.status === 'PENDING');
  const activeDisputes = dashboardData.disputes.filter((d) => d.status === 'ACTIVE');

  const [scoreTarget, setScoreTarget] = useState<Applicant | null>(null);

  return (
    <NeoCard>
      <NeoCardBody>
        <h3 className="font-bold text-lg mb-4">Program #{programId}</h3>

        {pendingApplicants.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold uppercase text-gray-500 mb-2">
              Applicants Awaiting Score ({pendingApplicants.length})
            </p>
            <div className="space-y-2">
              {pendingApplicants.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <span className="font-mono text-sm">{a.wallet.slice(0, 8)}…</span>
                  <NeoButton
                    label="Score"
                    variant="primary"
                    size="sm"
                    onClick={() => setScoreTarget(a)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {proposedMilestones.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold uppercase text-gray-500 mb-2">
              Proposed Milestones ({proposedMilestones.length})
            </p>
            <div className="space-y-2">
              {proposedMilestones.map((m) => (
                <CommitteeMilestoneVoteRow key={m.id} milestone={m} programId={programId} />
              ))}
            </div>
          </div>
        )}

        {activeDisputes.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase text-gray-500 mb-2">
              Active Disputes ({activeDisputes.length})
            </p>
            <div className="space-y-2">
              {activeDisputes.map((d) => (
                <CommitteeDisputeVoteRow key={d.id} dispute={d} programId={programId} />
              ))}
            </div>
          </div>
        )}

        {pendingApplicants.length === 0 &&
          proposedMilestones.length === 0 &&
          activeDisputes.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No pending committee actions.</p>
          )}
      </NeoCardBody>

      {scoreTarget && (
        <CommitteeScoreModal
          isOpen
          onClose={() => setScoreTarget(null)}
          programId={programId}
          applicant={scoreTarget}
        />
      )}
    </NeoCard>
  );
}

function CommitteeMilestoneVoteRow({
  milestone,
  programId,
}: {
  milestone: Milestone;
  programId: number;
}) {
  const { voteOnMilestone, isPending } = useVoteOnMilestone();
  return (
    <div className="flex items-center justify-between bg-skpurple-light border border-black rounded-lg p-2">
      <div>
        <span className="font-bold text-sm">Milestone #{milestone.blockchainId}</span>
        <span className="text-xs text-gray-500 ml-2">
          ${formatUnits(BigInt(milestone.amount), 6)} USDC
        </span>
      </div>
      <div className="flex gap-1">
        <NeoButton
          label="✓ Approve"
          variant="success"
          size="sm"
          loading={isPending}
          disabled={isPending}
          onClick={() => voteOnMilestone(BigInt(milestone.blockchainId), BigInt(programId), true)}
        />
        <NeoButton
          label="✕ Reject"
          variant="danger"
          size="sm"
          loading={isPending}
          disabled={isPending}
          onClick={() => voteOnMilestone(BigInt(milestone.blockchainId), BigInt(programId), false)}
        />
      </div>
    </div>
  );
}

function CommitteeDisputeVoteRow({ dispute, programId }: { dispute: Dispute; programId: number }) {
  const { voteOnDispute, isPending } = useVoteOnDispute();
  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-300 rounded-lg p-2">
      <div>
        <span className="font-bold text-sm">Dispute #{dispute.blockchainId}</span>
        <span className="text-xs text-skred ml-2 font-bold">
          {dispute.disputeType.replace('_', ' ')}
        </span>
      </div>
      <div className="flex gap-1">
        <NeoButton
          label="Uphold"
          variant="danger"
          size="sm"
          loading={isPending}
          disabled={isPending}
          onClick={() => voteOnDispute(BigInt(dispute.blockchainId), BigInt(programId), true)}
        />
        <NeoButton
          label="Dismiss"
          variant="ghost"
          size="sm"
          loading={isPending}
          disabled={isPending}
          onClick={() => voteOnDispute(BigInt(dispute.blockchainId), BigInt(programId), false)}
        />
      </div>
    </div>
  );
}
