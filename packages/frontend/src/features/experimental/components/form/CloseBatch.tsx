import { Button } from '@/components/Button';
import { useCloseBatch } from '@/hooks/@programs/admin/use-close-batch';

function CloseBatch() {
  const [write] = useCloseBatch();

  return (
    <div className="w-fit">
      <Button onClick={write} label="Close Batch" />
    </div>
  );
}

export default CloseBatch;
