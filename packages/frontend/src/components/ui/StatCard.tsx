import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: "purple" | "red" | "yellow" | "green" | "cyan" | "orange";
  subtitle?: string;
}

const colorMap = {
  purple: "bg-skpurple-light text-skpurple",
  red:    "bg-skred-light text-skred",
  yellow: "bg-skyellow-light text-yellow-700",
  green:  "bg-skgreen text-green-800",
  cyan:   "bg-skcyan-light text-cyan-800",
  orange: "bg-orange-100 text-orange-700",
};

export function StatCard({ label, value, icon, color = "purple", subtitle }: StatCardProps) {
  return (
    <div className="neo-card p-4 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${colorMap[color]} flex items-center justify-center text-xl border-2 border-black neo-shadow-sm shrink-0`}>
        {icon ?? "📊"}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-2xl font-paytone truncate">{value}</span>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
    </div>
  );
}
