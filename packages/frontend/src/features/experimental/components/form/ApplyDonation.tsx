import { Button } from '@/components/Button';
import { useGetMilestoneTemplate } from '../../hooks/@programs/admin/use-get-milestone-template';

export default function ApplyDonation() {
  const { milestones } = useGetMilestoneTemplate();

  return (
    <div>
      <h1>Select Milestone</h1>
      <div className="flex flex-row gap-2">
        {milestones?.map(({ price }) => {
          return (
            <div className="w-fit">
              <Button label={String(price)} />
            </div>
          );
        })}
      </div>
      <h1>Selected Milestone</h1>
    </div>
  );
}
