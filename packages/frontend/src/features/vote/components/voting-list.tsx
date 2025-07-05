import { Button } from "@/components/Button";
import { CardScholarship } from "@/components/CardScholarship";
import { useGetPrograms } from "@/features/scholarship/hooks/get-programs";

export function VotingList() {
  const { programs } = useGetPrograms();
  if (!programs?.length)
    return (
      <div className="border-4 rounded-2xl p-20 my-auto neo-shadow place-content-center">
        <h2 className="font-paytone text-4xl mx-auto w-max">
          No Schoolarship Listed.
        </h2>
        <Button label="Create Schoolarship" />
      </div>
    );
  return (
    <div className=" grid grid-cols-3 w-max gap-18 mb-16">
      {programs?.map((program) => {
        return (
          <CardScholarship
            key={program.id}
            program={{
              id: Number(program.id),
              initiatorAddress: program.initiatorAddress,
              endDate: new Date(program.endDate ?? "").getTime(),
              startDate: new Date(program.startDate ?? "").getTime(),
              targetApplicant: Number(program.targetApplicant),
              programMetadataCID: program.title,
              programContractAddress: program.contractAddress,
            }}
          />
        );
      })}
    </div>
  );
}
