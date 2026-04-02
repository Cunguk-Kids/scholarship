import type { ProgramStatus } from "@/lib/api/types";

const PHASES = [
  { key: "CREATED",          label: "Setup",       icon: "⚙️" },
  { key: "APPLICATION_OPEN", label: "Apply",       icon: "📝" },
  { key: "SCREENING",        label: "Screening",   icon: "🔍" },
  { key: "VOTING",           label: "Voting",      icon: "🗳️" },
  { key: "ACTIVE",           label: "Active",      icon: "🎓" },
  { key: "COMPLETED",        label: "Completed",   icon: "✅" },
] as const;

const statusOrder: Record<string, number> = {
  CREATED: 0, APPLICATION_OPEN: 1, SCREENING: 2,
  VOTING: 3, ACTIVE: 4, COMPLETED: 5, CANCELLED: -1,
};

export function PhaseTimeline({
  currentStatus,
  className = "",
}: {
  currentStatus: ProgramStatus;
  className?: string;
}) {
  const currentIndex = statusOrder[currentStatus] ?? 0;
  const isCancelled = currentStatus === "CANCELLED";

  return (
    <div className={`flex items-center w-full gap-0 ${className}`}>
      {PHASES.map((phase, i) => {
        const isComplete = !isCancelled && i < currentIndex;
        const isCurrent = !isCancelled && i === currentIndex;
        const isFuture = i > currentIndex || isCancelled;

        return (
          <div key={phase.key} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-lg
                  transition-all duration-300
                  ${isComplete ? "bg-skgreen shadow-[2px_2px_0_0_rgba(0,0,0)]" : ""}
                  ${isCurrent ? "bg-skyellow shadow-[3px_3px_0_0_rgba(0,0,0)] scale-110 animate-pulse-glow" : ""}
                  ${isFuture ? "bg-gray-100" : ""}
                  ${isCancelled ? "bg-skred-light opacity-50" : ""}
                `}
              >
                {isComplete ? "✓" : phase.icon}
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${isCurrent ? "text-skpurple" : "text-gray-500"}`}>
                {phase.label}
              </span>
            </div>

            {/* Connector line */}
            {i < PHASES.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-1 mt-[-1.25rem]
                  transition-all duration-300
                  ${isComplete ? "bg-skgreen-dark" : "bg-gray-300"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
