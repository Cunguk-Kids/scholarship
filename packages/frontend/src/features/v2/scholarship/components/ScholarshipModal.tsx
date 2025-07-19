import { CardForm, type FormDataProvider } from "@/components/CardForm";
import { useCreateProgram } from "@/features/scholarship/hooks/create-program";
import { appStateInjection } from "@/hooks/inject/app-state";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ScholarshipModal = ({ isOpen, onClose }: Props) => {
  const {
    loading: { setLoading },
  } = appStateInjection.use();
  const [{ mutate, isPending }] = useCreateProgram();

  if (!isOpen) return null;

  const handleSubmit = (formData?: FormDataProvider) => {
    // setLoading({ type: "proccessing" });
    mutate(
      {
        title: formData.scholarshipName,
        description: formData.description,
        start: new Date().getTime(),
        end: new Date(formData?.deadline).getTime(),
        target: formData.recipientCount,
      },
      {
        onSuccess: () => {
          setLoading({ type: "success" });
        },
        onError: (error) => {
          setLoading({ type: "error", message: "" + error });
        },
      }
    );
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
