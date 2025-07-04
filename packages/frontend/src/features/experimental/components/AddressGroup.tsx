import { useGetPrograms } from '@/features/scholarship/hooks/get-programs';
import { Button } from '@/components/Button';
import { ExperimentalInjection } from '../context/experimental-context';

function AddressGroup() {
  // hooks
  const { programs } = useGetPrograms();

  const { setter } = ExperimentalInjection.use();

  return (
    <div className="flex flex-row gap-2">
      {programs?.map(({ programContractAddress }, i) => {
        return (
          <div key={i} className="w-fit mb-4">
            <Button
              onClick={() => setter.setAddress(programContractAddress as `0x`)}
              label={`${programContractAddress.slice(0, 10)}.....`}
              size="small"
            />
          </div>
        );
      })}
    </div>
  );
}

export default AddressGroup;
