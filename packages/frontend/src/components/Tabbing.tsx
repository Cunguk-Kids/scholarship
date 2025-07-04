import { useState } from "react";
import { CardScholarship } from "./CardScholarship";

const tabs = [
  {
    id: "active",
    label: "Active Scholarships",
    color: "bg-skpurple",
  },
  {
    id: "vote",
    label: "On Voting",
    color: "bg-skred",
  },
  {
    id: "soon",
    label: "Coming Soon",
    color: "bg-skgreen",
  },
] as const;

type TabStatus = (typeof tabs)[number]["id"];

const TabButton = ({
  //   id,
  label,
  isActive,
  color,
  onClick,
}: {
  id: TabStatus;
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  const baseStyle =
    "gap-[0.625rem] items-end rounded-t-3xl px-6 text-2xl font-normal border-l-4 border-t-4 border-r-4 border-black text-black";
  const activeStyle = "bg-skbw py-6";
  const inactiveStyle = `${color} border-b-4 py-4`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
    >
      {label}
    </button>
  );
};

export const Tabbing = () => {
  const [activeTab, setActiveTab] = useState<TabStatus>("active");

  return (
    <div className="grow min-w-[70.5rem]">
      {/* Tabs */}
      <div className="relative -left-2 -top-1 shrink-0 z-10 flex items-end -space-x-1">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            color={tab.color}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Cards */}
      <div className="shrink-0 bg-black rounded-3xl w-full">
        <div className="relative w-full h-[35.875rem] bg-skbw rounded-e-3xl rounded-bl-3xl border-4 -left-2 -top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[3.75rem] p-20">
            {[...Array(2)].map((_, i) => (
              <CardScholarship key={i} status={activeTab} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
