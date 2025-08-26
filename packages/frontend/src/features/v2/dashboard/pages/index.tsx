import { ProgramCreatorDashboard } from "./program-creator-dashboard";
import { StudentDashboardPage } from "./student-dashboard";
import { pageState } from "../context/page-state";

const arc = `
polygon(
  100% 0,
  0 0,
  0 100%,
  5% 94%,
  10% 92%,
  15% 90%,
  20% 89%,
  25% 88%,
  30% 87%,
  35% 86%,
  40% 85%,
  45% 84.5%,
  50% 84%,
  55% 84.5%,
  60% 85%,
  65% 86%,
  70% 87%,
  75% 88%,
  80% 89%,
  85% 91%,
  90% 93%,
  95% 96%,
  100% 100%
)
`;
export function DashboardPageV2() {
  const provider = pageState.init();

  return (
    <pageState.provider value={provider}>
      {!provider.isStudentDashboard && (
        <div className="absolute top-0 bg-skpurple left-0 right-0 h-[50vh] -z-1" />
      )}
      <main
        className={`${"flex max-md:px-3 px-9 gap-9 w-full overflow pb-9 relative isolate min-h-screen max-lg:flex-col"} ${provider.isStudentDashboard ? "bg-skred" : "bg-skyellow"}`}
      >
        <div
          className={`${"h-[60vh] absolute right-0 left-0 pointer-events-none -top-px"} ${provider.isStudentDashboard ? "bg-skbw" : "bg-skpurple"}`}
          style={{
            clipPath: arc,
          }}
        ></div>
        {provider.isStudentDashboard ? (
          <StudentDashboardPage />
        ) : (
          <ProgramCreatorDashboard />
        )}
      </main>
    </pageState.provider>
  );
}
