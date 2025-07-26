import { CardScholarship } from "@/components/CardScholarship";
import { useGetPrograms } from "@/features/scholarship/hooks/get-programs";

export const VotingList = ({ onClickVote }) => {
  const { programs } = useGetPrograms();
  if (!programs?.length)
    return (
      <div className="border-4 rounded-2xl p-20 my-auto neo-shadow place-content-center">
        <h2 className="font-paytone text-4xl mx-auto w-max">
          No Schoolarship Listed.
        </h2>
        {/* <Button label="Create Schoolarship" /> */}
      </div>
    );

  return (
    <>
      {programs &&
        programs.length > 0 &&
        programs.map((item: any, i) => (
          <CardScholarship
            key={i}
            program={{
              id: Number(item.id),
              initiatorAddress: item.initiatorAddress,
              endDate: new Date(item.endDate ?? "").getTime(),
              startDate: new Date(item.startDate ?? "").getTime(),
              targetApplicant: Number(item.targetApplicant),
              programMetadataCID: item.title,
              programContractAddress: item.contractAddress,
            }}
            labelButton={"Vote Now"}
            // status={activeTab}
            onClickButton={() => onClickVote(item.id)}
          />
        ))}
    </>
  );
};
