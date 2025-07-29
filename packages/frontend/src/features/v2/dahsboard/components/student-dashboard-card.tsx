import { BaseCard } from "./base-card";

export function StudentDashboardCard(props: {
  name: string;
  motivationHeadline: string;
  profileImage: string;
  programTitle: string;
  programCreator: string;
  totalFund: number;
  milestoneProgress?: React.ReactNode;
  programCreatorImage: string;
}) {
  return (
    <BaseCard className="space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="bg-skpink w-max px-2 text-black rounded-full">
              Student
            </div>
            <h1 className="font-paytone text-2xl">Hi, {props.name}!</h1>
          </div>
          <div className="size-10 bg-skyellow rounded-2xl"></div>
        </div>
        <h2>{props.motivationHeadline}</h2>
      </div>
      <div>
        <img
          src={props.profileImage}
          className="size-38 rounded-3xl mx-auto"
          alt={props.name}
        />
      </div>
      <p>Active Scholarship:</p>
      <h2 className="text-2xl font-bold">{props.programTitle}</h2>
      <div className="flex items-center gap-2">
        <img
          className="size-5 rounded-full font-semibold"
          src={props.programCreatorImage}
          alt={props.programCreator}
        />
        <h3 className="block">
          {props.programCreator.slice(0, 7)}...
          {props.programCreator.slice(-4)}
        </h3>
      </div>
      <p>Total Fund Recieved:</p>
      <div className="flex items-center gap-2">
        <img
          className="size-4"
          src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694"
          alt="usd"
        />
        <p>{props.totalFund / 10 ** 6}</p>
      </div>
      {props.milestoneProgress}
    </BaseCard>
  );
}
