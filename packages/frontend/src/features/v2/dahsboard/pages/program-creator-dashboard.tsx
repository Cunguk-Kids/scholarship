import { useMemo, useState } from "react";
import { useGetProgramCreatorProfile } from "../hooks/get-program-creator-profile";
import { MessageCard } from "../components/message-from-program-creator-card";
import {
  BaseTabbing,
  BaseTabbingContent,
  BaseTabbingList,
  BaseTabbingTrigger,
} from "../components/base-tabbing";
import { CurrentBalance } from "../components/current-balance";
import { ComingSoon } from "@/components/fallback/comming-soon";
import { SwitchDashboard } from "../components/switch-dashboard";
import { ProgramDashboardCard } from "../components/program-dashboard-card";
import { useAccount } from "wagmi";
import { MilestoneApproval } from "../components/milestone-approval";
import { NotFoundStudentFallback } from "../components/notfound-student-fallback";
import { useApproveMilestoneV2 } from "../hooks/approve-milestone";
import toast from "react-hot-toast";

export function ProgramCreatorDashboard() {
  const account = useAccount();
  const { data, isLoading } = useGetProgramCreatorProfile();
  const { mutate } = useApproveMilestoneV2();
  const [index, setCurrentIndex] = useState(0);
  const next = () => {
    const length = data?.programss?.items?.length ?? 0;
    setCurrentIndex((x) => (x + 1) % length);
  };
  const item = data?.programss?.items?.[index];

  const isExist = Boolean(data?.programss?.items?.length);

  const milestones = useMemo(
    () =>
      item?.milestones.items.sort((a, b) => a.blockchainId! - b.blockchainId!),
    [item?.milestones.items]
  );
  return (
    <>
      <div className="lg:max-w-[24rem] space-y-6">
        <SwitchDashboard />
        <ProgramDashboardCard
          programDescription={item?.description ?? ""}
          programId={item?.blockchainId ?? 0}
          clickNext={next}
          isLoading={isLoading || !isExist}
          programCreator={account.address ?? "0x0"}
          programCreatorImage={`https://api.dicebear.com/9.x/thumbs/svg?seed=${account.address}`}
          programTitle={item?.name ?? ""}
          totalFund={item?.totalFund ?? 0}
        />
        <MessageCard
          isLoading={isLoading || !isExist}
          message={`Hi, Ms., Please approve my last milestone submission. Have a nice day!`}
          sender={item?.milestones.items[0]?.student.studentAddress ?? ""}
        />
      </div>
      <BaseTabbing defaultValue="milestones" className="grow">
        <BaseTabbingList>
          <BaseTabbingTrigger className="bg-skpink" value="milestones">
            Milestones Progress & Proof
          </BaseTabbingTrigger>
          <BaseTabbingTrigger className="bg-skyellow" value="achivement">
            My Achievements
          </BaseTabbingTrigger>
        </BaseTabbingList>
        <BaseTabbingContent value="milestones" className="flex-col gap-4">
          <div className="flex h-max justify-between max-md:flex-col max-md:gap-3">
            <div className="text-lg">
              Track how each selected student is progressing through their
              scholarship journey.
            </div>
            <CurrentBalance />
          </div>
          <div className="h-px bg-black/40"></div>
          {(isExist || isLoading) && (
            <MilestoneApproval
              onApprove={(mile) => {
                mutate(mile.blockchainId ?? 0);
              }}
              onDeny={() => {
                toast.success("Coming Soon");
              }}
              isLoading={isLoading}
              milestones={milestones ?? []}
            />
          )}
          {!isExist && !isLoading && <NotFoundStudentFallback />}
        </BaseTabbingContent>
        <BaseTabbingContent value="achivement">
          <ComingSoon className="w-full justify-center" />
        </BaseTabbingContent>
      </BaseTabbing>
    </>
  );
}
