/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { CardScholarship } from "./CardScholarship";
import { CardVote } from "./CardVote";
import { useTokenRate } from "@/context/token-rate-context";

type Tab = {
  id: string;
  label: string;
  color: string;
};

type TabButtonProps = {
  id: string;
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
};

const TabButton = ({ label, isActive, color, onClick }: TabButtonProps) => {
  const baseStyle =
    "gap-[0.625rem] items-end rounded-t-3xl px-6 text-2xl font-normal border-l-4 border-t-4 border-r-4 border-black text-black font-paytone";
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

export const Tabbing = <T,>({
  programs,
  tabs,
  type = "program",
  onClickTabbing,
  onClickButtonItem,
  ...props
}: {
  programs?: T[];
  tabs: Tab[];
  type?: string;
  onClickTabbing?: (item: Record<string, T>, activeTab: string) => void;
  onClickButtonItem?: (id: string, item?: Record<string, T>) => void;
  currentBalance?: string;
  participants?: any[];
}) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? "");
  const { rate } = useTokenRate();

  // const onClickAction = (item: Record<string, T>, activeTab: string) => {
  //   if (onClickTabbing) onClickTabbing(item, activeTab);
  // };

  const handleClickItemButton = (id: string, item: Record<string, T>) => {
    if (onClickButtonItem) {
      onClickButtonItem(id, item);
    }
  };

  return (
    <div className="grow">
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

      <div className="shrink-0 bg-black rounded-3xl w-full">
        <div className="relative w-full bg-skbw rounded-e-3xl rounded-bl-3xl border-4 -left-2 -top-2">
          {type.toLowerCase() === "program" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[3.75rem] p-20">
              {/* <CardVote
                onSubmit={() => {
                  if (onClickTabbing) onClickTabbing({ participantAddress: 'aa' }, activeTab);
                }}
              /> */}
              {activeTab === "vote" &&
                props?.participants?.map((item) => (
                  <div className="h-full w-full relative">
                    <CardVote
                      onSubmit={() => {
                        if (onClickTabbing) onClickTabbing(item, activeTab);
                      }}
                    />
                  </div>
                ))}
              {activeTab !== "vote" &&
                programs &&
                programs.length > 0 &&
                programs.map((item: any, i) => (
                  <CardScholarship
                    key={i}
                    program={{
                      ...item,
                      id: Number(item.id),
                      initiatorAddress: item.initiatorAddress,
                      endDate: new Date(item.endDate ?? "").getTime(),
                      startDate: new Date(item.startDate ?? "").getTime(),
                      targetApplicant: Number(item.targetApplicant),
                      programMetadataCID: item.title,
                      programContractAddress: item.contractAddress,
                    }}
                    labelButton={
                      activeTab === "active"
                        ? "Apply Now"
                        : activeTab === "vote"
                          ? "Vote Now"
                          : "Donate Now"
                    }
                    status={activeTab}
                    onClickButton={() =>
                      handleClickItemButton(item.blockchainId, item)
                    }
                    liskToIDR={rate || 0}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
