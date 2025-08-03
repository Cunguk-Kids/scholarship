import { useRef, useState, useEffect } from 'react';
import { Arrow } from './Arrow';
import { Input } from './Input';
import { ConfirmationModal } from './ConfirmationModal';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicantSchema, providerSchema } from '@/features/v2/scholarship/validations/schemas';
import { CurrencyConverter } from '@/features/v2/scholarship/components/CurrencyConverter';
import { sumBy } from 'lodash';
import { idrToUsdc } from '@/util/localCurrency';
import { createPopper } from '@popperjs/core';

interface CardFormProps<T extends 'applicant' | 'provider'> {
  totalStep: number;
  type: T;
  totalFund?: number;
  totalParticipant?: number;
  rate?: number;
  onSubmit: (formData: T extends 'applicant' ? FormData : FormDataProvider) => void;
  onClose?: () => void;
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
  selectionMethod: 'dao' | 'jury' | 'hybrid';
};

const createEmptyMilestone = (): MilestoneData => ({
  type: '',
  description: '',
  amount: '',
});

export const CardForm = <T extends 'applicant' | 'provider'>({
  totalStep = 2,
  onSubmit,
  onClose = () => {},
  type,
  totalFund,
  rate,
  totalParticipant,
}: CardFormProps<T>) => {
  // ref
  const referenceRefs = useRef<Array<HTMLDivElement | null>>([]);
  const popperRefs = useRef<Array<HTMLDivElement | null>>([]);

  // state
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const parseIdr = (value: string) => Number(value?.replace(/[^\d]/g, ''));

  const schema = type === 'applicant' ? applicantSchema : providerSchema;

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues:
      type === 'applicant'
        ? {
            fullName: '',
            email: '',
            studentId: '',
            milestones: [createEmptyMilestone()],
          }
        : {
            scholarshipName: '',
            description: '',
            deadline: '',
            recipientCount: '5',
            totalFund: '',
            distributionMethod: 'milestone',
            selectionMethod: 'dao',
          },
  });

  const milestones = watch('milestones');

  useEffect(() => {
    const timer = setTimeout(() => {
      const reference = referenceRefs.current[selectedIndex];
      const popper = popperRefs.current[selectedIndex];

      if (reference && popper && show) {
        const instance = createPopper(reference, popper, {
          placement: 'bottom-start',
          modifiers: [
            {
              name: 'offset',
              options: { offset: [0, 8] },
            },
          ],
        });

        return () => {
          instance.destroy();
        };
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [show]);

  useEffect(() => {
    popperRefs.current = Array(milestones?.length).fill(null);
  }, [milestones?.length]);
  useEffect(() => {
    referenceRefs.current = Array(milestones?.length).fill(null);
  }, [milestones?.length]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
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

  const handleAddMilestone = () => append(createEmptyMilestone());

  const totalSpend = sumBy(watch('milestones'), 'amount');

  useEffect(() => {
    if (bottomRef.current && bottomRef.current.parentElement) {
      bottomRef.current.parentElement.scrollTo({
        top: bottomRef.current.offsetTop,
        behavior: 'smooth',
      });
    }
  }, [fields.length]);

  useEffect(() => {
    console.log(errors, '----errors-----');
  }, [errors]);

  return (
    <div className="flex p-12 items-start gap-6 self-stretch rounded-2xl bg-skbw w-full">
      {/* LEFT */}
      <div className="flex flex-col items-start gap-2 self-stretch w-2/3">
        <div className="flex items-center gap-6 self-stretch">
          {<Arrow direction="left" onClick={() => (step > 1 ? handleClickBack() : onClose())} />}
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
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Input
                        type="input"
                        placeholder="Your Name"
                        label="Full Name"
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState?.error}
                        helperText={fieldState?.error?.message}
                      />
                    );
                  }}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Input
                        type="input"
                        label="Email Address (optional)"
                        placeholder="Your Email"
                        note="Used only for updates. Your privacy matters."
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState?.error}
                        helperText={fieldState?.error?.message}
                      />
                    );
                  }}
                />

                <Controller
                  name="studentId"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Input
                        type="input"
                        label="Student ID Number (required)"
                        placeholder="Your Student ID"
                        note="We will match your Student ID Number with PDDIKTI"
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState?.error}
                        helperText={fieldState?.error?.message}
                      />
                    );
                  }}
                />
              </>
            ) : type === 'provider' ? (
              <>
                <Controller
                  name="scholarshipName"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Input
                        type="input"
                        label="Give your scholarship a name"
                        placeholder="Your scholarship Name"
                        note="This is how it’ll appear in listings and during voting."
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState?.error}
                        helperText={fieldState?.error?.message}
                      />
                    );
                  }}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Input
                        type="input"
                        label="Describe your scholarship"
                        placeholder="Your scholarship description"
                        note="Share purpose, vision, and who you want to help."
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState?.error}
                        helperText={fieldState?.error?.message}
                      />
                    );
                  }}
                />
                <Controller
                  name="deadline"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Input
                        type="date"
                        label="Set a Deadline for Applications"
                        placeholder=""
                        note="Final date for student applications before voting starts. Give them time to share their story."
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState?.error}
                        helperText={fieldState?.error?.message}
                      />
                    );
                  }}
                />
              </>
            ) : null)}

          {step === 2 &&
            (type === 'applicant' ? (
              <div>
                {fields.map((_m, i) => (
                  <div
                    key={i}
                    className="flex flex-col bg-skbw rounded-xl w-full relative gap-4 p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold">Milestone {i + 1}</div>
                      {fields.length > 1 && (
                        <button
                          onClick={() => remove(i)}
                          className="text-skred text-sm hover:underline">
                          Remove
                        </button>
                      )}
                    </div>
                    {show && selectedIndex === i && (
                      <div
                        ref={(el) => {
                          popperRefs.current[selectedIndex] = el;
                        }}
                        className="z-10 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black p-2 rounded-lg">
                        <CurrencyConverter
                          exchangeRate={rate || 1}
                          usdAmount={(totalFund || 1) / 1_000_000}
                          totalParticipant={totalParticipant || 1}
                          participantSpend={totalSpend}
                        />
                      </div>
                    )}
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
                    <Controller
                      name={`milestones.${i}.description`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Input
                          type="input"
                          label="Milestone Description"
                          placeholder="Milestone Description"
                          value={field.value}
                          onChange={field.onChange}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          note="Explain how the fund will be used in this step."
                        />
                      )}
                    />
                    <Controller
                      name={`milestones.${i}.amount`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Input
                          ref={(el) => {
                            referenceRefs.current[i] = el;
                          }}
                          isCurrency
                          type="input"
                          label="Requested Amount (Rp)"
                          placeholder="e.g., Rp 3,000,000"
                          value={String(parseIdr)}
                          onChange={(values) => {
                            const idr = Number(values) || 0;
                            const usdc = idrToUsdc(idr);
                            field.onChange(String(usdc));
                          }}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          note="How much do you need for this specific milestone?"
                          onClickNote={() => {
                            setSelectedIndex(i);
                            setShow(!show);
                          }}
                        />
                      )}
                    />
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            ) : (
              <>
                <Controller
                  name="recipientCount"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Input
                        type="slider-token"
                        label="Number of Recipients"
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState?.error}
                        helperText={fieldState?.error?.message}
                      />
                    );
                  }}
                />

                <Controller
                  name="totalFund"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Input
                        type="input"
                        label="Total Fund"
                        placeholder="e.g., 100 USDC"
                        tokenSymbol="USDC"
                        conversionRate={0.00000000614}
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState?.error}
                        helperText={fieldState?.error?.message}
                      />
                    );
                  }}
                />
              </>
            ))}

          {step === 3 &&
            (type === 'applicant' ? (
              <></>
            ) : (
              <>
                <Controller
                  name="selectionMethod"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Input
                        type="radio-group"
                        label="Who selects the recipients?"
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
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState?.error}
                        helperText={fieldState?.error?.message}
                      />
                    );
                  }}
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
        errors={errors}
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={handleSubmit((data) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSubmit(data as any);
        })}
        title={type === 'provider' ? 'DAO Smart Contract Notice' : "You're Ready to Submit!"}
        desc={
          type === 'provider'
            ? 'By publishing, your funds will be securely locked and released only when students complete verified milestones.'
            : 'By submitting, you agree that your data will be stored securely and transparently for the purpose of DAO voting and milestone tracking.'
        }
        primaryLabel={type === 'provider' ? 'Publish' : 'Submit'}
        secondaryLabel={type === 'provider' ? 'Back' : 'Review Agian'}
      />
    </div>
  );
};
