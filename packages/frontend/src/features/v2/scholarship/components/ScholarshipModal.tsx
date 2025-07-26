import { CardForm, type FormDataProvider } from "@/components/CardForm";
import { appStateInjection } from "@/hooks/inject/app-state";
import { useCreateProgramV2 } from "../hooks/create-program";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ScholarshipModal = ({ isOpen, onClose }: Props) => {
  const {
    loading: { setLoading },
  } = appStateInjection.use();
  const { mutate } = useCreateProgramV2();

  if (!isOpen) return null;

  const handleSubmit = (formData: FormDataProvider) => {
    // setLoading({ type: "proccessing" });
    mutate(formData, {
      onSuccess: () => {
        setLoading({ type: "success" });
      },
      onError: (error) => {
        setLoading({ type: "error", message: "" + error.shortMessage });
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-9/12 relative shadow-x">
        <CardForm
          type="provider"
          totalStep={3}
          onSubmit={handleSubmit}
          onClose={() => onClose()}
        />
      </div>
    </div>
  );
};
