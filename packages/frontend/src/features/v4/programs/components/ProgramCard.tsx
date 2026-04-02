import { Link } from "@tanstack/react-router";
import { NeoCard, NeoCardBody, NeoCardFooter } from "@/components/ui/NeoCard";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { WalletAvatar, shortenAddress } from "@/components/ui/WalletAvatar";
import type { Program, ProgramMetadata } from "@/lib/api/types";

interface ProgramCardProps {
  program: Program;
  meta?: ProgramMetadata;
}

const accentByStatus: Record<string, "purple" | "red" | "yellow" | "green" | "cyan" | "orange"> = {
  CREATED:          "cyan",
  APPLICATION_OPEN: "yellow",
  SCREENING:        "orange",
  VOTING:           "purple",
  ACTIVE:           "green",
  COMPLETED:        "purple",
  CANCELLED:        "red",
};

/** Format USDC amount (6 decimals) to display */
function formatUSDC(raw: string): string {
  const n = Number(raw) / 1e6;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ProgramCard({ program, meta }: ProgramCardProps) {
  const accent = accentByStatus[program.status] ?? "purple";

  return (
    <Link to={`/programs/${program.id}`}>
      <NeoCard accent={accent} className="h-full flex flex-col">
        <NeoCardBody className="flex-1 space-y-3">
          {/* Header row: status + education level */}
          <div className="flex items-center justify-between">
            <NeoBadge status={program.status} />
            <span className="text-xs font-bold text-gray-400 uppercase">
              #{program.blockchainId}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-paytone text-lg leading-tight line-clamp-2">
            {meta?.name ?? `Program #${program.blockchainId}`}
          </h3>

          {/* Description */}
          {meta?.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{meta.description}</p>
          )}

          {/* Initiator */}
          <div className="flex items-center gap-2">
            <WalletAvatar address={program.initiator} size={24} />
            <span className="text-xs font-mono text-gray-500">
              {shortenAddress(program.initiator)}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center">
              <p className="text-lg font-bold">${formatUSDC(program.totalFund)}</p>
              <p className="text-xs text-gray-500">Total Fund</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{program.applicantCount}</p>
              <p className="text-xs text-gray-500">Applicants</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{program.targetWinners}</p>
              <p className="text-xs text-gray-500">Winners</p>
            </div>
          </div>
        </NeoCardBody>

        <NeoCardFooter className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {program.status === "APPLICATION_OPEN"
              ? `Closes ${formatDate(program.applicationEnd)}`
              : program.status === "VOTING"
              ? `Vote until ${formatDate(program.votingEnd)}`
              : `Created ${formatDate(program.createdAt)}`
            }
          </span>
          <span className="font-bold text-skpurple hover:underline">View →</span>
        </NeoCardFooter>
      </NeoCard>
    </Link>
  );
}
