import { Button } from '@/components/Button';
import { useOpenVote } from '@/hooks/admin/use-open-vote';

function OpenVote() {
  const [write] = useOpenVote();

  return (
    <div className="w-fit">
      <Button onClick={write} label="Open Vote" />
    </div>
  );
}

export default OpenVote;
