import { CardForm } from '@/components/CardForm';
import { useApplyApplicantV2 } from '../hooks/apply-applicant';

type Props = {
  ref: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programAmount?: number;
  totalParticipant?: number;
  rate: number;
};

export const ApplicantModal = ({
  ref,
  isOpen,
  onClose,
  programId,
  rate,
  programAmount,
  totalParticipant,
}: Props) => {
  const { mutate } = useApplyApplicantV2(programId);
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-9/12 relative shadow-x">
        <CardForm
          type="applicant"
          totalStep={2}
          totalFund={programAmount}
          totalParticipant={totalParticipant || 1}
          rate={rate}
          onSubmit={(data) => {
            mutate(data);
          }}
          onClose={() => onClose()}
        />
      </div>
    </div>
  );
};
