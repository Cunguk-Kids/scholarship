import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrograms } from "@/lib/api/hooks";
import { fetchProgramMeta } from "@/lib/ipfs";
import { useSSE } from "@/lib/sse/useSSE";
import type { Program, ProgramMetadata, ProgramStatus } from "@/lib/api/types";
import { ProgramCard } from "../components/ProgramCard";
import { NeoCardSkeleton } from "@/components/ui/NeoSkeleton";
import { NeoButton } from "@/components/ui/NeoButton";
import SplitText from "@/components/ui/split-text";
import { CreateProgramModal } from "../components/CreateProgramModal";

const STATUS_TABS: Array<{ label: string; value: ProgramStatus | "ALL" }> = [
  { label: "All",         value: "ALL" },
  { label: "Open",        value: "APPLICATION_OPEN" },
  { label: "Screening",   value: "SCREENING" },
  { label: "Voting",      value: "VOTING" },
  { label: "Active",      value: "ACTIVE" },
  { label: "Completed",   value: "COMPLETED" },
];

export function ProgramsPage() {
  const [activeTab, setActiveTab] = useState<ProgramStatus | "ALL">("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // SSE for real-time updates
  const { data: sseEvent } = useSSE<{ step: string }>({
    url: `${import.meta.env.VITE_BACKEND_HOST}/sse`,
    event: "main",
  });

  // Fetch programs
  const { data: result, isLoading, refetch } = usePrograms(
    activeTab === "ALL" ? undefined : { status: activeTab }
  );

  // Refetch on SSE events
  useEffect(() => {
    if (sseEvent?.step === "ProgramCreated" || sseEvent?.step === "ProgramStatusChanged") {
      refetch();
    }
  }, [sseEvent, refetch]);

  const programs = result?.data ?? [];

  return (
    <div className="w-full min-h-screen">
      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 pt-8 pb-16 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="font-paytone text-5xl md:text-6xl">
            <SplitText
              text="Empower the Future."
              delay={150} duration={0.6} ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }}
              threshold={0.1} rootMargin="-50px" textAlign="center"
            />
          </h1>
          <p className="font-nunito text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto">
            <SplitText
              text="Transparent scholarships powered by smart contracts. Funds go directly to students."
              delay={50} duration={0.6} ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 30 }} to={{ opacity: 1, y: 0 }}
              threshold={0.1} rootMargin="-50px" textAlign="center"
            />
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <NeoButton label="Create Program" variant="primary" size="lg" onClick={() => setIsCreateModalOpen(true)} />
            <NeoButton
              label="Connect Wallet"
              variant="connect"
              size="lg"
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-skyellow rounded-full border-2 border-black opacity-30 animate-float" />
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-skpink rounded-full border-2 border-black opacity-30 animate-float" style={{ animationDelay: "1s" }} />
      </section>

      {/* ── Programs Section ────────────────────────────────────────────────── */}
      <section id="programs" className="px-6 md:px-12 py-12 bg-skyellow relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="font-paytone text-4xl md:text-5xl mb-2">Find a Program</h2>
            <p className="text-xl text-gray-700">Your next opportunity starts here</p>
          </div>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  px-4 py-2 rounded-xl border-2 border-black font-bold text-sm
                  transition-all duration-150
                  ${activeTab === tab.value
                    ? "bg-black text-white shadow-none translate-x-0.5 translate-y-0.5"
                    : "bg-white text-black neo-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(0,0,0)]"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Program grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <NeoCardSkeleton key={i} />
              ))}
            </div>
          ) : programs.length === 0 ? (
            <div className="neo-card p-12 text-center">
              <p className="text-6xl mb-4">📭</p>
              <p className="font-paytone text-xl">No programs found</p>
              <p className="text-gray-500 mt-2">Try a different filter or create a new program</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map(program => (
                <ProgramCardWithMeta key={program.id} program={program} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-skbw" style={{ clipPath: "ellipse(70% 100% at 50% 100%)" }} />
      </section>

      <CreateProgramModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

/** Program card that fetches IPFS metadata */
function ProgramCardWithMeta({ program }: { program: Program }) {
  const { data: meta } = useQuery({
    queryKey: ["ipfs-meta", program.metadataCID],
    queryFn: () => fetchProgramMeta(program.metadataCID),
    enabled: !!program.metadataCID,
    staleTime: Infinity,
  });

  return <ProgramCard program={program} meta={meta ?? undefined} />;
}
