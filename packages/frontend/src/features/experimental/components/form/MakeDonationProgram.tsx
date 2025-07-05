import { Button } from '@/components/Button';
import { useDonateToProgram } from '../../hooks/@ParentProgram/use-donate-program';
import { ExperimentalInjection } from '../../context/experimental-context';

export default function MakeDonationProgram() {
  const [write] = useDonateToProgram();
  const {
    data: { id },
  } = ExperimentalInjection.use();

  return (
    <div className="w-fit">
      <Button onClick={() => id && write(BigInt(id))} label="Make Donation" />
    </div>
  );
}
