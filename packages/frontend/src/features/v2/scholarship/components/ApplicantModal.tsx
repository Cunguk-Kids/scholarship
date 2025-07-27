import { CardForm } from "@/components/CardForm";
import { useApplyApplicantV2 } from "../hooks/apply-applicant";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
};

export const ApplicantModal = ({ isOpen, onClose, programId }: Props) => {
  const { mutate } = useApplyApplicantV2(programId);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-9/12 relative shadow-x">
        <CardForm
          type="applicant"
          totalStep={3}
          onSubmit={(data) => {
            mutate(data);
          }}
          onClose={() => onClose()}
        />
      </div>
    </div>
  );
};
