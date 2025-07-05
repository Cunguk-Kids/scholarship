import { Button } from '@/components/Button';
import { useGetMilestoneTemplate } from '../../hooks/@programs/admin/use-get-milestone-template';
import { ExperimentalInjection } from '../../context/experimental-context';
import { useApplyProgram } from '../../hooks/@ParentProgram/use-apply-program';

export default function ApplyDonationProgram() {
  const { milestones } = useGetMilestoneTemplate();

  const [write] = useApplyProgram();

  const {
    ref: { id},
    setter: { handleSelectMilestone },
    data: { selectedMilestone },
  } = ExperimentalInjection.use();

  const handleSubmit = () => id.current && write(BigInt(id.current), selectedMilestone);
  return (
    <div>
      <h1>Select Milestone</h1>
      <div className="flex flex-row gap-2">
        {milestones?.map(({ price }, index) => {
          const haveValue = selectedMilestone.find((item) => item.templateId === BigInt(index));

          if (haveValue) return <></>;
          return (
            <div key={index} className="w-fit">
              <Button
                label={String(price)}
                onClick={() => {
                  handleSelectMilestone({
                    metadata: '',
                    mType: Number(0),
                    price: BigInt(0),
                    templateId: BigInt(index),
                  });
                }}
              />
            </div>
          );
        }) || <div className="text-gray-400 text-sm italic">No form available.</div>}
      </div>
      <h1>Selected Milestone</h1>
      {milestones?.map(({ price }, index) => {
        const haveValue = selectedMilestone.find((item) => item.templateId === BigInt(index));

        if (!haveValue) return <></>;
        return (
          <div key={index} className="w-fit">
            <Button
              label={String(price)}
              onClick={() => {
                handleSelectMilestone({
                  metadata: '',
                  mType: Number(0),
                  price: BigInt(0),
                  templateId: BigInt(index),
                });
              }}
            />
          </div>
        );
      }) || <div className="text-gray-400 text-sm italic">No form available.</div>}
      <div className="w-fit mt-5">
        <Button onClick={handleSubmit} label="Apply" />
      </div>
    </div>
  );
}
