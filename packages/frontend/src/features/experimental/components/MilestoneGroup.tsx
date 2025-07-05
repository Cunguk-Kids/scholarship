import { Button } from '@/components/Button';
import { ExperimentalInjection } from '../context/experimental-context';
import { useGetMilestoneTemplate } from '../hooks/@programs/admin/use-get-milestone-template';

function MilestoneGroup() {
  // hooks
  const { milestones } = useGetMilestoneTemplate();

  const { setter } = ExperimentalInjection.use();

  return (
    <div className="flex flex-row gap-2">
      {milestones?.map(({ price }, i) => {
        return (
          <div key={i} className="w-fit mb-4">
            <Button onClick={() => null} label={`${price}`} size="small" />
          </div>
        );
      })}
    </div>
  );
}

export default MilestoneGroup;
