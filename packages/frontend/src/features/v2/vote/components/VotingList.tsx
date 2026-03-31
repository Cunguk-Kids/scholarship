import { CardScholarship } from '@/components/CardScholarship';
import { useTokenRate } from '@/context/token-rate-context';
import { useProgramsV2 } from '@/hooks/v2/data/usePrograms';

export const VotingList = ({
  onClickVote,
}: {
  onClickVote: (id: number | null, indexerId: string | null) => void;
}) => {
  const { data: programs } = useProgramsV2();
  const { rate } = useTokenRate();

  if (!programs?.length)
    return (
      <div className="border-4 rounded-2xl p-20 my-auto neo-shadow place-content-center">
        <h2 className="font-paytone text-4xl mx-auto w-max">No Schoolarship Listed.</h2>
        {/* <Button label="Create Schoolarship" /> */}
      </div>
    );

  return (
    <>
      {programs &&
        programs.length > 0 &&
        programs.map((item, i) => (
          <CardScholarship
            key={i}
            program={{
              ...item,
              id: Number(item.id),
              initiatorAddress: item.creator,
              endDate: new Date(new Date(item.endAt ?? '').getTime() ?? '').getTime(),
              startDate: new Date(new Date(item.startAt ?? '').getTime() ?? '').getTime(),
              targetApplicant: Number(item.totalRecipients),
              programContractAddress: '',
            }}
            labelButton={'Vote Now'}
            // status={activeTab}
            onClickButton={() => onClickVote(item.blockchainId, item.id)}
            liskToIDR={rate || 0}
          />
        ))}
    </>
  );
};
