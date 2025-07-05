import { Button } from "@/components/Button";
import { useGetMilestoneTemplate } from "../../hooks/@programs/admin/use-get-milestone-template";
import { ExperimentalInjection } from "../../context/experimental-context";
import { useApplyProgram } from "../../hooks/@programs/applicant/use-apply-program";
import { useGetProgramContract } from "@/features/scholarship/hooks/get-programs";

export default function ApplyDonation() {
  const {
    ref: { id },
    data: { address },
  } = ExperimentalInjection.use();
  const { milestones } = useGetMilestoneTemplate();

  const app = useGetProgramContract(address || "0x0");

  const [write] = useApplyProgram({
    address: address || "0x",
    appBatch: app.appBatch?.result ?? 0n,
    applicantSize: app.applicantSize?.result ?? 0n,
    nextMilestoneId: app.nextMilestone?.result ?? 0n,
    programId: BigInt(+id.current),
  });

  const {
    setter: { handleSelectMilestone },
    data: { selectedMilestone },
  } = ExperimentalInjection.use();

  const handleSubmit = () => {
    write.mutate({
      milestones: selectedMilestone.map((item) => ({
        ...item,
        title: "",
        description: "",
      })),
      name: "IDK",
    });
  };

  return (
    <div>
      <h1>Select Milestone</h1>
      <div className="flex flex-row gap-2">
        {milestones?.map(({ price }, index) => {
          const haveValue = selectedMilestone.find(
            (item) => item.templateId === BigInt(index)
          );

          if (haveValue) return <></>;
          return (
            <div key={index} className="w-fit">
              <Button
                label={String(price)}
                onClick={() => {
                  handleSelectMilestone({
                    metadata: "",
                    mType: Number(0),
                    price: BigInt(0),
                    templateId: BigInt(index),
                  });
                }}
              />
            </div>
          );
        }) || (
          <div className="text-gray-400 text-sm italic">No form available.</div>
        )}
      </div>
      <h1>Selected Milestone</h1>
      {milestones?.map(({ price }, index) => {
        const haveValue = selectedMilestone.find(
          (item) => item.templateId === BigInt(index)
        );

        if (!haveValue) return <></>;
        return (
          <div key={index} className="w-fit">
            <Button
              label={String(price)}
              onClick={() => {
                handleSelectMilestone({
                  metadata: "",
                  mType: Number(0),
                  price: BigInt(0),
                  templateId: BigInt(index),
                });
              }}
            />
          </div>
        );
      }) || (
        <div className="text-gray-400 text-sm italic">No form available.</div>
      )}
      <div className="w-fit mt-5">
        <Button onClick={handleSubmit} label="Apply" />
      </div>
    </div>
  );
}
