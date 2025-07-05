import { Button } from '@/components/Button';
import { useApplicant } from '../../hooks/@programs/applicant/use-list-applicant';
import { ExperimentalInjection } from '../../context/experimental-context';
import { useVoteApplicant } from '../../hooks/@programs/vote/use-vote-applicant';

export const VoteForm = () => {
  const [write] = useVoteApplicant();
  const { applicants } = useApplicant();
  const {
    setter: { handleSelectParticipant },
    data: { selectedParticipant },
  } = ExperimentalInjection.use();

  const handleSubmit = () => {
    write(selectedParticipant);
  };
  return (
    <div className="flex flex-col gap-4 flex-wrap w-full">
      <h1>Select Applicant</h1>
      <div className="flex flex-row gap-2">
        {applicants?.[0]?.map((item, index) => {
          if (selectedParticipant === item) return <></>;

          return (
            <div key={index} className="w-fir">
              <Button
                label={String(item.slice(0, 10))}
                onClick={() => {
                  handleSelectParticipant(item);
                }}
              />
            </div>
          );
        }) || <div className="text-gray-400 text-sm italic">No form available.</div>}
      </div>
      <h1>Selected Applicant</h1>
      <div className="flex flex-row gap-2">
        {applicants?.[0]?.map((item, index) => {
          if (selectedParticipant !== item) return <></>;

          return (
            <div key={index} className="w-fir">
              <Button
                label={String(item.slice(0, 10))}
                onClick={() => {
                  handleSelectParticipant(item);
                }}
              />
            </div>
          );
        }) || <div className="text-gray-400 text-sm italic">No form available.</div>}
      </div>
      <div className="w-fit mt-5">
        <Button onClick={handleSubmit} label="Vote" />
      </div>
    </div>
  );
};
