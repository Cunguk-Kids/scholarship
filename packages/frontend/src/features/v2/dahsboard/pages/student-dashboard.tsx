import { useGetStudentProfile } from "../hooks/get-student-profile";
import { useSubmitMilestoneV2 } from "../hooks/submit-milestone";
import Timeline from "@/components/Timeline";
import { MessageFromProgramCreator } from "../components/message-from-program-creator-card";
import { StudentDashboardCard } from "../components/student-dashboard-card";
import {
  BaseTabbing,
  BaseTabbingContent,
  BaseTabbingList,
  BaseTabbingTrigger,
} from "../components/base-tabbing";
import { CurrentBalance } from "../components/current-balance";
import { Milestones } from "../components/milestones";

export function StudentDashboardPage() {
  const { mutate, isPending } = useSubmitMilestoneV2();
  const { data } = useGetStudentProfile();
  console.log(data);
  return (
    <>
      <div className="lg:max-w-[24rem] space-y-6">
        <StudentDashboardCard
          name="Utami"
          motivationHeadline="Let’s get you one step closer to your dreams."
          profileImage="https://api.dicebear.com/9.x/thumbs/svg?seed=Utami"
          programCreator="0x31242u309482904890284028402340"
          programCreatorImage="https://api.dicebear.com/9.x/thumbs/svg?seed=0x31242u309482904890284028402340"
          programTitle="Creative Futures Grant"
          // USDC with 6 decimals
          totalFund={45_000 * 10 ** 6}
          milestoneProgress={
            <div>
              Disbursment:
              <Timeline
                items={[
                  {
                    amount: 45_000,
                    description: "Tuition",
                    blockchainId: 2,
                    estimation: 20,
                  },
                  {
                    amount: 45_000,
                    description: "Tuition",
                    blockchainId: 2,
                    estimation: 20,
                  },
                  {
                    amount: 45_000,
                    description: "Tuition",
                    blockchainId: 2,
                    estimation: 20,
                  },
                ]}
              />
            </div>
          }
        />
        <MessageFromProgramCreator
          message="Keep creating and keep believing, Utami. You’ve got talent—this is just the beginning. 💫"
          programCreator="0x31242u309482904890284028402340"
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
          <Milestones
            isPending={isPending}
            onSubmit={(milestone, prove) => {
              mutate([milestone.id + "", prove]);
            }}
            milestones={[
              {
                id: 1,
                title: "Tuition Payment",
                price: 182530000,
                type: "disbursed",
              },
              {
                id: 2,
                title: "Coursework Essentials",
                price: 60840000,
                type: "pending",
              },
              {
                id: 3,
                title: "Thesis Project",
                price: 60840000,
                type: "locked",
              },
            ]}
          />
        </BaseTabbingContent>
        <BaseTabbingContent value="achivement">Achivement</BaseTabbingContent>
      </BaseTabbing>
    </>
  );
}
