/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/Button';
import { useVoteApplicant } from '@/hooks/@programs/vote/use-vote-applicant';

function VotingForm({ addressParticipant }: { addressParticipant: string }) {
  const [write] = useVoteApplicant();

  console.log(addressParticipant, 'addressParticipant form');

  const handleSubmit = () => {
    if (addressParticipant) {
      write(addressParticipant as any);
    }
  };
  return (
    <div className="space-y-4">
      <div>
        <p className="font-paytone text-xl">Wallet Address</p>
        <p className="font-paytone text-md">{addressParticipant}</p>
      </div>
      <div className="w-fit mt-2">
        <Button size="large" onClick={handleSubmit} label="Vote" />
      </div>
    </div>
  );
}

export default VotingForm;
