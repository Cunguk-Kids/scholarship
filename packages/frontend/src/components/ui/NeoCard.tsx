import type { ReactNode } from "react";

interface NeoCardProps {
  children: ReactNode;
  className?: string;
  accent?: "purple" | "red" | "yellow" | "green" | "cyan" | "orange" | "pink" | "none";
  hoverable?: boolean;
  onClick?: () => void;
}

const accentColors: Record<string, string> = {
  purple: "bg-skpurple",
  red:    "bg-skred",
  yellow: "bg-skyellow",
  green:  "bg-skgreen",
  cyan:   "bg-skcyan",
  orange: "bg-skorange",
  pink:   "bg-skpink",
  none:   "",
};

export function NeoCard({
  children,
  className = "",
  accent = "none",
  hoverable = true,
  onClick,
}: NeoCardProps) {
  const hoverClass = hoverable
    ? "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_rgba(0,0,0)]"
    : "";
  const cursorClass = onClick ? "cursor-pointer" : "";

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white border-2 border-black rounded-2xl overflow-hidden
        shadow-[4px_4px_0_0_rgba(0,0,0)]
        transition-all duration-150 ease-out
        ${hoverClass} ${cursorClass} ${className}
      `}
    >
      {accent !== "none" && (
        <div className={`h-1.5 w-full ${accentColors[accent]}`} />
      )}
      {children}
    </div>
  );
}

/** Sub-component for consistent card padding */
export function NeoCardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

/** Sub-component for card footer with border-top */
export function NeoCardFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-5 py-3 border-t-2 border-black bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}
