import Timeline from "@/components/Timeline";
import { MessageFromProgramCreator } from "../components/message-from-program-creator-card";
import { StudentDashboardCard } from "../components/student-dashboard-card";


export function DashboardPageV2() {
  return (
    <main className="flex px-9 gap-9 w-full overflow-hidden pb-9">
      <div className="max-w-[24rem] space-y-6">
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
      <div className="flex bg-skbw grow border rounded-2xl">
      </div>
    </main>
  );
}
