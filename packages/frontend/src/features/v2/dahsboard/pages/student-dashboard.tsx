import { useGetStudentProfile } from "../hooks/get-student-profile";
import { useSubmitMilestoneV2 } from "../hooks/submit-milestone";
import Timeline from "@/components/Timeline";
import { MessageCard } from "../components/message-from-program-creator-card";
import { StudentDashboardCard } from "../components/student-dashboard-card";
import {
  BaseTabbing,
  BaseTabbingContent,
  BaseTabbingList,
  BaseTabbingTrigger,
} from "../components/base-tabbing";
import { CurrentBalance } from "../components/current-balance";
import { Milestones } from "../components/milestones";
import { useMemo, useState } from "react";
import { ComingSoon } from "@/components/fallback/comming-soon";
import { NotFoundStudentFallback } from "../components/notfound-student-fallback";
import { SwitchDashboard } from "../components/switch-dashboard";

export function StudentDashboardPage() {
  const { mutate, isPending } = useSubmitMilestoneV2();
  const { data, isLoading } = useGetStudentProfile();
  const [index, setCurrentIndex] = useState(0);
  const next = () => {
    const length = data?.studentss?.items.length ?? 0;
    setCurrentIndex((x) => (x + 1) % length);
  };
  const item = data?.studentss?.items?.[index];
  const totalFund = useMemo(
    () => item?.milestones.items.reduce((a, b) => a + (b.amount ?? 0), 0) ?? 0,
    [item]
  );
  const milestones = useMemo(() => {
    let usedPending = false;
    return (item?.milestones.items ?? [])
      .sort((a, b) => (a.blockchainId ?? 0) - (b.blockchainId ?? 0))
      .map((item) => {
        const type = item.proveCID
          ? "disbursed"
          : usedPending
            ? "locked"
            : "pending";
        if (!item.proveCID) usedPending = true;
        return {
          ...item,
          type,
        } as const;
      });
  }, [item]);

  const isExist = Boolean(data?.studentss?.items?.length);
  return (
    <>
      <div className="lg:max-w-[24rem] space-y-6">
        <SwitchDashboard />
        <StudentDashboardCard
          isLoading={isLoading || !isExist}
          studentId={item?.blockchainId ?? 0}
          milestoneType={item?.program.milestoneType ?? ""}
          programId={item?.program.blockchainId ?? 0}
          name={item?.fullName ?? "No Name"}
          motivationHeadline="Let’s get you one step closer to your dreams."
          profileImage={`https://api.dicebear.com/9.x/thumbs/svg?seed=${item?.id}`}
          programCreator={item?.program?.creator ?? "0x0"}
          programCreatorImage={`https://api.dicebear.com/9.x/thumbs/svg?seed=${item?.program.creator}`}
          programTitle={item?.program.name ?? "No Name"}
          // USDC with 6 decimals
          totalFund={totalFund}
          clickNext={next}
          milestoneProgress={
            <div>
              Disbursment:
              <Timeline items={item?.milestones.items ?? []} />
            </div>
          }
        />
        <MessageCard
          isLoading={isLoading || !isExist}
          message={`Keep creating and keep believing, ${item?.fullName ?? "No Name"}. You’ve got talent—this is just the beginning. 💫`}
          sender={item?.program.creator ?? "0x0"}
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
              Share your milestones! Every proof keeps your scholarship provider
              and public informed.
            </div>
            <CurrentBalance />
          </div>
          <div className="h-px bg-black/40"></div>
          {isExist && !isLoading ? (
            <Milestones
              isLoading={isLoading}
              isPending={isPending}
              onSubmit={(milestone, prove) => {
                mutate([milestone.blockchainId + "", prove]);
              }}
              milestones={milestones}
            />
          ) : (
            <NotFoundStudentFallback />
          )}
        </BaseTabbingContent>
        <BaseTabbingContent value="achivement">
          <ComingSoon className="w-full justify-center" />
        </BaseTabbingContent>
      </BaseTabbing>
    </>
  );
}
