import { Button } from '@/components/Button';
import { useMakeDonation } from '../../hooks/@programs/donor/use-make-donation';

export default function MakeDonation() {
  const [write] = useMakeDonation();

  return (
    <div className="w-fit">
      <Button onClick={write} label="Make Donation" />
    </div>
  );
}
