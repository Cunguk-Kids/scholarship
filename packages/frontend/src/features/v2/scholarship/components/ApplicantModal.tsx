import { CardForm } from "@/components/CardForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ApplicantModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-9/12 relative shadow-x">
        <CardForm
          type="applicant"
          totalStep={3}
          onSubmit={() => {}}
          onClose={() => onClose()}
        />
      </div>
    </div>
  );
};
