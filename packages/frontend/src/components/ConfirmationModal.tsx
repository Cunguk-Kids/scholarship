import type { FieldErrors } from 'react-hook-form';
import { Button } from './Button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  desc: string;
  primaryLabel: string;
  secondaryLabel: string;
  errors?: FieldErrors;
};

export const ConfirmationModal = ({
  errors,
  isOpen,
  onClose,
  onSubmit,
  title = "You're Ready to Submit!",
  desc = 'By submitting, you agree that your data will be stored securely and transparently for the purpose of DAO voting and milestone tracking.',
  primaryLabel,
  secondaryLabel,
}: Props) => {
  if (!isOpen) return null;

  function humanizeFieldName(field: string) {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex w-[26.5rem] p-6 flex-col items-center gap-8 rounded-xl bg-white shadow-xl">
        <div className="flex flex-col items-start gap-5 self-stretch">
          <img src="/icons/warning-icon.svg" alt="warning" />
          <div className="flex flex-col items-start gap-2 self-stretch">
            <h3 className="text-xl font-paytone">{title}</h3>
            <p className="text-sm">{desc}</p>
          </div>
          {Object.entries(errors || {}).length > 0 && (
            <div className="mt-4 text-red-600 text-sm">
              <ul>
                {Object.entries(errors || {}).map(([field, error]) => (
                  <li key={field}>
                    • <strong>{humanizeFieldName(field)}</strong>: {error?.message?.toString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center gap-6 self-stretch w-full">
          <Button
            label={secondaryLabel}
            onClick={onClose}
            size="small"
            variant="secondary"
            className="w-full"
          />
          <Button label={primaryLabel} onClick={onSubmit} size="small" className="w-full" />
        </div>
      </div>
    </div>
  );
};
