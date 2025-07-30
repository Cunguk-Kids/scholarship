import { StudentDashboardPage } from "./student-dashboard";

const arc = `
polygon(100% 0, 0 0, 0 100%, 11% 92%, 30% 87%, 51% 82%, 75% 85%, 86% 92%, 100% 100%)
`;
export function DashboardPageV2() {
  return (
    <main className="flex max-md:px-3 px-9 gap-9 w-full overflow-hidden pb-9 relative isolate bg-skred min-h-screen max-lg:flex-col">
      <div
        className="bg-skbw h-screen absolute right-0 left-0 pointer-events-none"
        style={{
          clipPath: arc,
        }}
      ></div>
      <StudentDashboardPage />
    </main>
  );
}
