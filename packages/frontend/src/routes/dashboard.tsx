import { CardDashboard } from "@/components/CardDashboard";
import { Tabbing } from "@/components/Tabbing";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const tabsDataDashboard = [
    {
      id: "milestone",
      label: "Milestone Progress & Proof",
      color: "bg-skpurple",
    },
    {
      id: "achievements",
      label: "My Achievements",
      color: "bg-skyellow",
    },
  ];
  return (
    <div className="w-full h-full flex flex-col">
      <div className="z-10 px-9">
        <div className="inline-flex items-center gap-[3.75rem]">
          <CardDashboard />
          <Tabbing programs={[]} tabs={tabsDataDashboard} type="milestone" />
        </div>
      </div>
      <div className="absolute z-0 w-screen h-screen justify-end">
        <img
          src="/img/Ellipse-pink.svg"
          alt="ellipse-pink"
          className="w-screen h-dvh"
        />
      </div>
    </div>
  );
}
