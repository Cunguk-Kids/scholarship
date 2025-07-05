import { CardDashboard } from "@/components/CardDashboard";
import { Tabbing } from "@/components/Tabbing";
import { useGetMilestonesAddress } from "@/hooks/@programs/milestones/use-get-milestones";
import {
  useGetProgram,
  useGetProgramContract,
} from "@/features/scholarship/hooks/get-programs";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { type Address } from "viem";
import { scholarshipProgramAbi } from "@/repo/abi";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const account = useAccount();
  const balance = useBalance({ address: account.address });
  const { data } = useGetMilestonesAddress(account.address as never);
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
  const user = useMemo(() => data?.[0], [data]);

  const milestones = useMemo(
    () =>
      data?.map(({ milestone }, i) => ({
        id: milestone.id,
        title: milestone.title,
        amount: milestone.price,
        status: "pending",
        isActive: true,
      })) ?? [],
    // {
    //   id: 2,
    //   title: "Coursework Essentials",
    //   amount: "Rp1.000.000",
    //   status: "pending",
    //   isActive: true,
    // },
    // {
    //   id: 4,
    //   title: "Coursework Essentials",
    //   amount: "Rp1.000.000",
    //   status: "pending",
    //   isActive: true,
    // },
    // {
    //   id: 3,
    //   title: "Thesis Project",
    //   amount: "Rp1.000.000",
    //   status: "locked",
    // },
    [data]
  );

  const totalFund = useMemo(
    () => data?.reduce((a, b) => a + +b.milestone.price, 0),
    [data]
  );

  const { programs } = useGetProgram(user?.milestone?.programId);

  const mlContracts = useReadContracts({
    contracts: data?.map(({ milestone }) => ({
      address: programs?.contractAddress as Address,
      abi: scholarshipProgramAbi,
      functionName: "getMilestone",
      args: [
        BigInt(milestone.batch ?? 0),
        BigInt(milestone.id.split("_")[2] ?? "0"),
      ],
    })),

    query: {
      enabled: Boolean(programs?.contractAddress) && Boolean(data),
    },
  });

  console.log(mlContracts);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="z-10 px-9">
        <div className="inline-flex items-center gap-[3.75rem]">
          <CardDashboard
            activeScholarship={programs?.title ?? ""}
            name={user?.applicants?.name ?? ""}
            programProvider={programs?.initiatorAddress ?? ""}
            totalFundReceived={`${totalFund ?? 0}`}
          />
          <Tabbing
            programs={milestones}
            tabs={tabsDataDashboard}
            type="milestone"
            currentBalance={balance.data?.value + " " + balance?.data?.symbol}
          />
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
