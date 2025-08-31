import { CardForm } from "@/components/CardForm";
import { useApplyApplicantV2 } from "../hooks/apply-applicant";
import type { AmountType } from "../validations/schemas";
import { Dialog } from "@/components/ui/dialog";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programAmount?: number;
  totalParticipant?: number;
  rate: number;
  programType?: AmountType;
  milestones?: [];
};

export const ApplicantModal = ({
  isOpen,
  onClose,
  programId,
  rate,
  programAmount,
  totalParticipant,
  programType = "FIXED",
  milestones = [],
}: Props) => {
  const { mutate } = useApplyApplicantV2(programId);
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <CardForm
        type="applicant"
        totalStep={2}
        totalFund={programAmount}
        totalParticipant={totalParticipant || 1}
        programType={programType}
        rate={rate}
        onSubmit={(data) => {
          mutate(data);
        }}
        onClose={() => onClose()}
        milestonesData={milestones}
      />
    </Dialog>
  );
};
