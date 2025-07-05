import { Button } from "./Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export const ConfirmationModal = ({ isOpen, onClose, onSubmit }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex w-[26.5rem] p-6 flex-col items-center gap-8 rounded-xl bg-white shadow-xl">
        <div className="flex flex-col items-start gap-5 self-stretch">
          <img src="/icons/warning-icon.svg" alt="warning" />
          <div className="flex flex-col items-start gap-2 self-stretch">
            <h3 className="text-xl font-paytone">You're Ready to Submit!</h3>
            <p className="text-sm">
              By submitting, you agree that your data will be stored securely
              and transparently for the purpose of DAO voting and milestone
              tracking.
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center gap-6 self-stretch">
          <Button
            label="Review Again"
            onClick={onClose}
            size="small"
            variant="secondary"
          />
          <Button label="Submit" onClick={onSubmit} size="small" />
        </div>
      </div>
    </div>
  );
};
