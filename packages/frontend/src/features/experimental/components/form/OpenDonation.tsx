import { Button } from '@/components/Button';
import { useOpenDonation } from '../../hooks/@programs/admin/use-open-donation';

function OpenDonation() {
  const [write] = useOpenDonation();

  return (
    <div className="w-fit">
      <Button onClick={write} label="Open Donation" />
    </div>
  );
}

export default OpenDonation;
