import { formatCurrency, formatUSDC } from "@/util/currency";
import type { useGetProgramCreatorProfile } from "../hooks/get-program-creator-profile";
import { Button } from "@/components/Button";
import { Loader } from "@/components/fallback/loader";

type MilestoneApprovalItem = NonNullable<
  ReturnType<typeof useGetProgramCreatorProfile>["data"]
>["programss"]["items"][0]["milestones"]["items"][0];

export function MilestoneApproval(props: {
  milestones: MilestoneApprovalItem[];
  onDeny?: (mile: MilestoneApprovalItem) => unknown;
  onApprove?: (mile: MilestoneApprovalItem) => unknown;
  isLoading: boolean;
}) {
  const onSeeProve = (mile: MilestoneApprovalItem) => {
    console.log(mile.proveCID);
  };

  const onDeny = (mile: MilestoneApprovalItem) => {
    props.onDeny?.(mile);
  };
  const onApprove = (mile: MilestoneApprovalItem) => {
    props.onApprove?.(mile);
  };

  return (
    <div className="@container relative grow">
      {props.isLoading && (
        <Loader className="absolute top-0 inset-0 m-auto size-10" />
      )}
      <table className="w-full" style={{ opacity: props.isLoading ? 0 : 1 }}>
        <tbody>
          {props.milestones.map((mile) => (
            <tr key={mile.blockchainId}>
              <td className="p-2 pt-4 w-16 align-top @max-[358px]:hidden">
                <img
                  className="size-10 rounded-full border-4 block"
                  src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${mile.student.id}`}
                />
              </td>
              <td className="w-1">
                <div className="flex flex-col py-2">
                  <p className="font-paytone capitalize text-2xl flex gap-2 items-center text-nowrap">
                    {mile.student.fullName}
                    <button
                      onClick={() => onSeeProve(mile)}
                      className="bg-black text-white rounded-full font-nunito text-xs py-1 px-2"
                    >
                      See Proof
                    </button>
                  </p>
                  <div className="flex">
                    <div className="flex flex-col">
                      <p>{mile.student.email}</p>
                      <p className="text-xs border px-2 w-max text-white rounded-full bg-skpurple">
                        Vote: {mile.student.votes.totalCount}
                      </p>

                      <div className="@max-[730px]:flex hidden flex-col justify-center">
                        <p className="text-xs text-nowrap ">
                          Milestone #{mile.blockchainId}
                        </p>
                        <p className="font-bold">{mile.description}</p>
                      </div>

                      <div className="font-bold pr-5 @max-[730px]:block hidden">
                        {formatCurrency(formatUSDC(mile.amount ?? 0), "USD")}
                      </div>
                      {!mile.isApproved && (
                        <div className="gap-4 @max-[600px]:flex hidden mt-4">
                          <Button
                            onClick={() => onDeny(mile)}
                            label="Deny"
                            className="bg-skred "
                          />
                          <Button
                            onClick={() => onApprove(mile)}
                            label="Approve"
                            className="@max-[625px]:w-full"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grow justify-end hidden mt-5 @max-[358px]:flex">
                      <img
                        className="size-20 rounded-full border-4 block"
                        src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${mile.student.studentAddress}`}
                      />
                    </div>
                  </div>
                </div>
              </td>
              <td className="align-top @max-[730px]:hidden">
                <div className="px-4 pt-6 flex flex-col justify-center">
                  <p className="text-xs text-nowrap ">
                    Milestone #{mile.blockchainId}
                  </p>
                  <p className="font-bold">{mile.description}</p>
                </div>
              </td>
              <td className="font-bold text-right pr-5 pt-6 @max-[730px]:hidden">
                {formatCurrency(formatUSDC(mile.amount ?? 0), "USD")}
              </td>
              <td className="w-1 align-top @max-[600px]:hidden">
                {!mile.isApproved && (
                  <div className="flex gap-4 px-2 @max-[625px]:flex-col pt-6">
                    <Button
                      onClick={() => onDeny(mile)}
                      label="Deny"
                      className="bg-skred @max-[625px]:w-full"
                    />
                    <Button
                      onClick={() => onApprove(mile)}
                      label="Approve"
                      className="@max-[625px]:w-full"
                    />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
