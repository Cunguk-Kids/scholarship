/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { CardScholarship } from './CardScholarship';
import MilestoneProgress from './MilestoneProgress';

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
    'gap-[0.625rem] items-end rounded-t-3xl px-6 text-2xl font-normal border-l-4 border-t-4 border-r-4 border-black text-black font-paytone';
  const activeStyle = 'bg-skbw py-6';
  const inactiveStyle = `${color} border-b-4 py-4`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}>
      {label}
    </button>
  );
};

export const Tabbing = <T,>({
  programs,
  tabs,
  type = 'program',
  onClickTabbing,
  ...props
}: {
  programs?: T[];
  tabs: Tab[];
  type?: string;
  onClickTabbing?: (item: Record<string, T>) => void;
  currentBalance?: string;
}) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? '');

  const onClickAction = (item: Record<string, T>) => {
    if (onClickTabbing) onClickTabbing(item);
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
          {type.toLowerCase() === 'program' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[3.75rem] p-20">
              {programs &&
                programs.length > 0 &&
                programs.map((item: any, i) => (
                  <CardScholarship
                    key={i}
                    program={{
                      id: Number(item.id),
                      initiatorAddress: item.initiatorAddress,
                      endDate: new Date(item.endDate ?? '').getTime(),
                      startDate: new Date(item.startDate ?? '').getTime(),
                      targetApplicant: Number(item.targetApplicant),
                      programMetadataCID: item.title,
                      programContractAddress: item.contractAddress,
                    }}
                    status={activeTab}
                    onClickButton={() => onClickAction(item)}
                  />
                ))}
            </div>
          )}
          {activeTab.toLowerCase() === 'milestone' && (
            <div className="flex px-4 pt-4 pb-8 flex-col items-start gap-2 shrink-0 rounded-b-2xl rounded-tr-2xl">
              <div className="flex items-start gap-2.5 self-stretch justify-between">
                <p className="w-1/2 flex flex-col justify-center">
                  Share your milestones! Every proof keeps your scholarship provider and public
                  informed.
                </p>
                <div className="flex py-2 px-6 flex-col justify-center items-end gap-1 self-stretch rounded-2xl bg-black">
                  <p className="text-sm font-medium text-white">Current Balance</p>
                  <h5 className="text-center font-bold text-white">{props.currentBalance}</h5>
                </div>
              </div>
              <div className="border-t h-1 self-stretch"></div>
              <div className="flex w-full items-start self-stretch">
                <MilestoneProgress milestones={programs as never} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
