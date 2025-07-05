import { CardDashboard } from "@/components/CardDashboard";
import { Tabbing } from "@/components/Tabbing";
import { useGetMilestonesAddress } from "@/hooks/@programs/milestones/use-get-milestones";
import { useGetProgram } from "@/features/scholarship/hooks/get-programs";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
} from "wagmi";
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

  const totalFund = useMemo(
    () => data?.reduce((a, b) => a + +b.milestone.price, 0),
    [data]
  );

  const { programs } = useGetProgram(user?.milestone?.programId);

  const mlContracts = useReadContracts({
    contracts: data?.map(({ milestone }) => {
      const [, batch, id] = milestone.id.split("_");
      return {
        address: programs?.contractAddress as Address,
        abi: scholarshipProgramAbi,
        functionName: "getMilestone",
        args: [BigInt(batch), BigInt(id)],
      };
    }),

    query: {
      enabled: Boolean(programs?.contractAddress) && Boolean(data),
    },
  });

  const { data: isCanWitdraw } = useReadContract({
    address: programs?.contractAddress as Address,
    abi: scholarshipProgramAbi,
    functionName: "isCanWithdraw",
    args: [BigInt(user?.milestone.id.split("_")[1] ?? 0)],
    query: {
      enabled:
        Boolean(programs?.contractAddress) &&
        Boolean(user?.applicants?.applicantAddress),
    },
  });

  const milestones = useMemo(() => {
    let isUsedActive = false;
    return (
      data?.map(({ milestone }, i) => {
        let isActive = false;
        // @ts-expect-error deep
        if (!mlContracts.data?.[i]?.result.isWithdrawed && !isUsedActive) {
          isUsedActive = true;
          isActive = true;
        }

        return {
          id: milestone.id,
          title: milestone.title,
          amount: milestone.price,
          status: isActive
            ? isCanWitdraw
              ? "pending"
              : "locked"
            : // @ts-expect-error deep
              mlContracts.data?.[i]?.result.isWithdrawed
              ? "disbursed"
              : "locked",
          isActive,
        };
      }) ?? []
    );
  }, [data, mlContracts.data, isCanWitdraw]);

  console.log(mlContracts.data);

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
