import { Button } from "@/components/Button";
import { BaseCard } from "./base-card";
import { pageState } from "../context/page-state";

export function SwitchDashboard() {
  const { setIsStudentDashboard } = pageState.use();
  return (
    <BaseCard className="flex items-center justify-between">
      <div className="font-paytone">Switch Dashboard</div>
      <div className="flex justify-end">
        <Button
          onClick={() => setIsStudentDashboard((x) => !x)}
          className="aspect-square !p-2 group"
          label={
            <svg
              className="size-4 group-active:-rotate-180 transition-transform"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          }
        />
      </div>
    </BaseCard>
  );
}
