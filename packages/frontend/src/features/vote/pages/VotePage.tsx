import { useEffect } from 'react';
import { useDonate } from '../../../hooks/donor/use-donate';
import { useOpenDonation } from '../../../hooks/admin/use-open-donation';

export default function VotePage() {
  // hooks
  const [write, { isPaused, isPending }] = useDonate();
  const [openDonation, { data }] = useOpenDonation();

  const handleDonate = () => {
    if (!isPending && !isPaused) {
      write({
        metadataUri: '',
        value: '1',
      });
    }
  };
  const handleOpenDonation = () => {
    if (!isPending && !isPaused) {
      openDonation();
    }
  };

  useEffect(() => {
    console.log(data, '-----data-----');
  }, [data]);

  return (
    <div className="grid grid-cols-2 relative m-10">
      <button className="cursor-pointer w-fit h-fit p-2 border rounded" onClick={handleDonate}>
        HandleDonate
      </button>
      <button
        className="cursor-pointer w-fit h-fit p-2 border rounded"
        onClick={handleOpenDonation}>
        Open Donation
      </button>
    </div>
  );
}
