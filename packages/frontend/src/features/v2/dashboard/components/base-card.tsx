import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function BaseCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={twMerge("p-4 border border-gray-200 rounded-2xl bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}
