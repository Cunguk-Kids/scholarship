import { useRef, useState, useEffect } from 'react';
import { Arrow } from './Arrow';
import { Input } from './Input';
import { ConfirmationModal } from './ConfirmationModal';

interface CardFormProps {
  totalStep: number;
  type: 'provider' | 'applicant';
  onSubmit: (formData?: FormData | FormDataProvider) => void;
}

type MilestoneData = {
  type: string;
  description: string;
  amount: string;
};

type FormData = {
  fullName: string;
  email: string;
  studentId: string;
  milestones: MilestoneData[];
};

export type FormDataProvider = {
  scholarshipName: string;
  description: string;
  deadline: string;
  recipientCount: number;
  totalFund: string;
  distributionMethod: string;
  selectionMethod: string;
};

const createEmptyMilestone = (): MilestoneData => ({
  type: '',
  description: '',
  amount: '',
});

export const CardForm = ({
  totalStep = 2,
  onSubmit = (formData?: FormData | FormDataProvider) => {},
  type = 'applicant',
}: CardFormProps) => {
  const [step, setStep] = useState(1);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    studentId: '',
    milestones: [createEmptyMilestone()],
  });
  const [formDataProvider, setFormDataProvider] = useState<FormDataProvider>({
    scholarshipName: '',
    description: '',
    deadline: '',
    recipientCount: 5,
    totalFund: '',
    distributionMethod: 'milestone',
    selectionMethod: 'dao',
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  const handleClickBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleClickForward = () => {
    if (step === totalStep) {
      setShowSubmitModal(true);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleFieldChange = (
    field: keyof Omit<FormData, 'milestones'> | keyof Omit<FormDataProvider, ''>,
    value: string,
    type: 'applicant' | 'provider',
  ) => {
    if (type === 'applicant') {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setFormDataProvider((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleMilestoneChange = (index: number, field: keyof MilestoneData, value: string) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      milestones: updatedMilestones,
    }));
  };

  const handleAddMilestone = () => {
    const newMilestone = createEmptyMilestone();
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
    }));
  };

  const handleRemoveMilestone = (index: number) => {
    if (formData.milestones.length === 1) return;
    const updated = formData.milestones.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      milestones: updated,
    }));
  };

  useEffect(() => {
    if (bottomRef.current && bottomRef.current.parentElement) {
      bottomRef.current.parentElement.scrollTo({
        top: bottomRef.current.offsetTop,
        behavior: 'smooth',
      });
    }
  }, [formData.milestones.length]);

  return (
    <div className="flex p-12 items-start gap-6 self-stretch rounded-2xl bg-skbw w-full">
      {/* LEFT */}
      <div className="flex flex-col items-start gap-2 self-stretch w-2/3">
        <div className="flex items-center gap-6 self-stretch">
          {step > 1 && <Arrow direction="left" onClick={handleClickBack} />}
          <h1 className="font-paytone text-5xl w-full">
            {type === 'applicant' && (step === 1 ? 'Basic Information' : 'Plan Milestones')}
            {type === 'provider' &&
              (step === 1
                ? 'Basic Information'
                : step === 2
                  ? 'Set Applicants'
                  : step === 3
                    ? 'Milestone Rules'
                    : '')}
          </h1>
        </div>
        <p className="text-xl">
          {type === 'applicant' &&
            (step === 1
              ? 'We’ll use this to verify your identity and contact you if needed.'
              : 'Break down how you’ll use the scholarship—clear, fair, and goal-oriented.')}
          {type === 'provider' &&
            (step === 1
              ? 'Your words shape your impact. Help applicants and voters understand your mission at a glance.'
              : step === 2
                ? "List any specific qualifications, fields of study, or background you'd like to support."
                : step === 3
                  ? 'Define how the fund will be distributed and how the recipients will be chosen.'
                  : '')}
        </p>
        {type === 'applicant' && <img src="/img/Provider-form.svg" alt="provider" />}
        {type === 'provider' && <img src="/img/Applicant-form.svg" alt="applicant" />}
      </div>

      {/* RIGHT */}
      <div className="flex flex-col items-end gap-2 self-stretch w-1/2">
        <div className="flex justify-end items-center gap-6 self-stretch">
          <h2 className="text-right font-paytone text-5xl">
            {step}/{totalStep}
          </h2>
          <Arrow
            direction="right"
            onClick={handleClickForward}
            // disabled={
            //   type === "applicant" &&
            //   step === 2 &&
            //   formData.milestones.length < 3
            // }
          />
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-4 self-stretch max-h-[600px] overflow-y-auto pr-2">
          {step === 1 &&
            (type === 'applicant' ? (
              <>
                <Input
                  type="input"
                  label="Full Name (required)"
                  placeholder="Your Name"
                  value={formData.fullName}
                  onChange={(val) => handleFieldChange('fullName', val, type)}
                />
                <Input
                  type="input"
                  label="Email Address (optional)"
                  placeholder="Your Email"
                  note="Used only for updates. Your privacy matters."
                  value={formData.email}
                  onChange={(val) => handleFieldChange('email', val, type)}
                />
                <Input
                  type="input"
                  label="Student ID Number (required)"
                  placeholder="Your Student ID"
                  note="We will match your Student ID Number with PDDIKTI"
                  value={formData.studentId}
                  onChange={(val) => handleFieldChange('studentId', val, type)}
                />
              </>
            ) : type === 'provider' ? (
              <>
                <Input
                  type="input"
                  label="Give your scholarship a name"
                  placeholder="Your scholarship Name"
                  note="This is how it’ll appear in listings and during voting."
                  value={formDataProvider.scholarshipName}
                  onChange={(val) => handleFieldChange('scholarshipName', val, type)}
                />
                <Input
                  type="input"
                  label="Describe your scholarship"
                  placeholder="Your scholarship description"
                  note="Share purpose, vision, and who you want to help."
                  value={formDataProvider.description}
                  onChange={(val) => handleFieldChange('description', val, type)}
                />
                <Input
                  type="input"
                  label="Set a Deadline for Applications"
                  placeholder=""
                  note="Final date for student applications before voting starts. Give them time to share their story."
                  value={formDataProvider.deadline}
                  onChange={(val) => handleFieldChange('deadline', val, type)}
                />
              </>
            ) : null)}

          {step === 2 &&
            (type === 'applicant' ? (
              <>
                {formData.milestones.map((m, i) => (
                  <div
                    key={i}
                    className="flex flex-col bg-skbw rounded-xl w-full relative gap-4 p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold">Milestone {i + 1}</div>
                      {formData.milestones.length > 1 && (
                        <button
                          onClick={() => handleRemoveMilestone(i)}
                          className="text-skred text-sm hover:underline">
                          Remove
                        </button>
                      )}
                    </div>
                    {/* <Input
                      type="dropdown"
                      label="Milestone Type"
                      placeholder="Select a category"
                      value={m.type}
                      onChange={(val) => handleMilestoneChange(i, 'type', val)}
                      note="What category does this milestone fall under?"
                      options={[
                        { label: 'Tuition Fee', value: 'tuition' },
                        { label: 'Equipment', value: 'equipment' },
                        { label: 'Living Cost', value: 'cost' },
                        { label: 'Project', value: 'project' },
                        { label: 'Other', value: 'other' },
                      ]}
                    /> */}
                    <Input
                      type="input"
                      label="Milestone Description"
                      placeholder="Milestone Description"
                      value={m.description}
                      onChange={(val) => handleMilestoneChange(i, 'description', val)}
                      note="Explain how the fund will be used in this step."
                    />
                    <Input
                      type="input"
                      label="Requested Amount (Rp)"
                      placeholder="e.g., Rp 3,000,000"
                      value={m.amount}
                      onChange={(val) => handleMilestoneChange(i, 'amount', val)}
                      note="How much do you need for this specific milestone?"
                    />
                  </div>
                ))}
                <div ref={bottomRef} />
              </>
            ) : (
              <>
                <Input
                  type="slider-token"
                  label="Number of Recipients"
                  value={formDataProvider.recipientCount.toString()}
                  onChange={(val) => handleFieldChange('recipientCount', val, type)}
                  note={`You're giving ${formDataProvider.recipientCount} students a chance to change lives.`}
                />

                <Input
                  type="input"
                  label="Total Fund MON"
                  placeholder="e.g., 45000 MON"
                  value={formDataProvider.totalFund}
                  onChange={(val) => handleFieldChange('totalFund', val, type)}
                  tokenSymbol="MON"
                  conversionRate={0.00000000614}
                />
              </>
            ))}

          {step === 3 &&
            (type === 'applicant' ? (
              <></>
            ) : (
              <>
                <Input
                  type="radio-group"
                  label="Who selects the recipients?"
                  value={formDataProvider.selectionMethod}
                  onChange={(val) => handleFieldChange('selectionMethod', val, type)}
                  options={[
                    {
                      label: 'Public DAO Vote',
                      value: 'dao',
                      description: '(recommended for transparency)',
                    },
                    {
                      label: 'Private Jury',
                      value: 'jury',
                      description: '(you decide)',
                      disabled: true,
                    },
                    {
                      label: 'Hybrid',
                      value: 'hybrid',
                      description: '(your jury shortlist + DAO votes final)',
                      disabled: true,
                    },
                  ]}
                />
              </>
            ))}
        </div>

        {/* ACTION BUTTONS */}
        {type === 'applicant' && step === 2 && (
          <div className="flex flex-col gap-4 w-full mt-4">
            <button
              type="button"
              onClick={handleAddMilestone}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-white rounded-full border border-gray-300 text-black shadow-sm hover:bg-gray-100">
              <span className="text-xl">＋</span> Add Other Milestone
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      <ConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={() => {
          setShowSubmitModal(false);
          onSubmit(type === 'applicant' ? formData : formDataProvider);
          console.log('submit', type === 'applicant' ? formData : formDataProvider);
        }}
      />
    </div>
  );
};
