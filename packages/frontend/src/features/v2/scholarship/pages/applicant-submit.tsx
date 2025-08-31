import { Arrow } from "@/components/Arrow";
import { useReplaceRootClass } from "@/hooks/use-replace-root-class";
import { createInjection } from "@/util/create-inject";
import { formatCurrency, formatUSDC, usdToIdr } from "@/util/currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearch } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { Address } from "viem";
import { applicantSchema, type ApplicantSchema } from "../validations/schemas";
import { Input } from "@/components/Input";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { twMerge } from "tailwind-merge";
import { CurrencyConverter } from "../components/CurrencyConverter";
import { useTokenRate } from "@/context/token-rate-context";
import { idrToUsdc, usdcToIdr } from "@/util/localCurrency";
import { appStateInjection } from "@/hooks/inject/app-state";
import toast from "react-hot-toast";
import { wait } from "@/util/supense";

interface ScholarshipType {
  blockchainId: 5;
  creator: Address;
  description: string;
  endAt: string;
  endDate: number;
  id: string;
  initiatorAddress: Address;
  milestoneType: "USER_DEFINED" | "FIXED";
  milestonesProgram: string[];
  name: string;
  ongoingAt: string;
  startAt: string;
  startDate: number;
  totalFund: number;
  totalRecipients: number;
  votingAt: string;
}

const applicantSubmitPageState = createInjection(
  (scholarshipData: ScholarshipType) => {
    const {
      loading: { setLoading },
    } = appStateInjection.use();
    const [step, setStep] = useState(1);
    const totalStep = steps.length;
    const isHasNext = step <= totalStep;
    const isHasPrev = step > 1;
    const next = () => {
      if (step === totalStep)
        return setLoading({
          type: "alert-confirmation",
          title: "You're Ready to Submit!",
          description:
            "By submitting, you agree that your data will be stored securely and transparently for the purpose of DAO voting and milestone tracking.",
          acceptLabel: "Submit",
          rejectLabel: "Review Again",
          onAccept: async () => {
            setLoading({ type: "proccessing" });
            await wait(5_000);
            setLoading({ type: "confirmation" });
            toast.success("Form Submited!");
          },
          onReject: () => {
            setLoading({ type: "none" });
          },
        });
      setStep((x) => x + 1);
    };
    const prev = () => setStep((x) => x - 1);
    const form = useForm({
      mode: "onChange",
      resolver: zodResolver(applicantSchema),
      defaultValues: {
        fullName: "",
        email: "",
        studentId: "",
        achievements: [],
        milestones: [
          {
            type: "FIXED",
            description: "",
            amount: String(
              formatUSDC(
                scholarshipData.totalFund /
                  (scholarshipData.totalRecipients || 1)
              ) / 1
            ),
          },
        ],
      },
    });

    return {
      step,
      setStep,
      isHasNext,
      isHasPrev,
      next,
      prev,
      form,
      scholarshipData,
    };
  }
);

function LayoutStep(props: {
  children: [title: string, subtitle: string, children: () => ReactNode];
}) {
  const { isHasNext, isHasPrev, next, prev, step } =
    applicantSubmitPageState.use();
  const Children = props.children[2];
  return (
    <div className="rounded-3xl bg-skbw flex p-12 text-black flex-col max-sm:p-6">
      <div className="font-paytone text-5xl flex gap-4"></div>
      <div className="flex gap-6 max-lg:flex-col">
        <div className="flex flex-col gap-4 h-max sticky bottom-24 mt-auto max-lg:flex-col-reverse">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 items-center text-4xl max-sm:text-2xl font-paytone">
              {isHasPrev && (
                <Arrow
                  direction="left"
                  onClick={prev}
                  className="max-sm:hidden"
                />
              )}
              <h1>{props.children[0]}</h1>
              <div className="hidden items-center gap-4 justify-end ml-auto max-lg:flex max-sm:hidden">
                <span className="text-4xl font-paytone max-sm:text-2xl">
                  {step}/{steps.length}
                </span>
                {isHasNext && <Arrow direction="right" onClick={next} />}
              </div>
            </div>
            <h2 className="text-xl w-[503px] max-lg:w-full max-sm:text-sm">
              {props.children[1]}
            </h2>
          </div>
          <img
            src="/img/Provider-form.svg"
            alt="provider"
            className="-mb-12 max-lg:w-fit max-lg:mb-0"
          />
        </div>
        <div className="flex flex-col gap-4 grow">
          <div className="flex items-center gap-4 justify-end max-lg:hidden">
            <span className="text-4xl font-paytone">
              {step}/{steps.length}
            </span>
            {isHasNext && <Arrow direction="right" onClick={next} />}
          </div>
          <Children />
        </div>
      </div>
      <div className="hidden max-sm:flex gap-5 mt-6 justify-center">
        {isHasPrev && <Arrow direction="left" onClick={prev} />}
        <span className="text-4xl font-paytone max-sm:text-2xl">
          {step}/{steps.length}
        </span>
        {isHasNext && <Arrow direction="right" onClick={next} />}
      </div>
    </div>
  );
}

const steps = [
  [
    "Basic Information",
    "We’ll use this to verify your identity and contact you if needed.",
    () => {
      const { form } = applicantSubmitPageState.use();
      return (
        <>
          <Controller
            name="fullName"
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
      );
    },
  ],
  [
    "Achievements",
    "Share academic or personal milestones that show your passion, effort, or progress.",
    () => {
      const { form } = applicantSubmitPageState.use();
      const [achivementsLength, setAchivementsLength] = useState(
        form.getValues("achievements")?.length || 1
      );
      const watchValue = form.watch(
        `achievements.${achivementsLength - 1}.name`
      );
      return (
        <>
          <div className="@container">
            <div className="grid grid-cols-2 @max-[450px]:grid-cols-1">
              {Array.from({ length: achivementsLength }, (_, index) => (
                <div
                  className={twMerge(
                    "flex flex-col",
                    index == 0 && "col-[1/-1]"
                  )}
                  key={index + "_achievements"}
                >
                  <Controller
                    name={`achievements.${index}.name`}
                    control={form.control}
                    render={({ field, fieldState }) => {
                      return (
                        <Input
                          type="input"
                          placeholder=""
                          label={`Achievement ${index + 1}`}
                          value={field.value}
                          onChange={field.onChange}
                          error={!!fieldState?.error}
                          helperText={fieldState?.error?.message}
                          onKeydown={(e) => {
                            if (e.key === "Backspace" && !field.value)
                              setAchivementsLength((x) => Math.max(x - 1, 1));
                          }}
                        />
                      );
                    }}
                  />
                  <Controller
                    name={`achievements.${index}.file`}
                    control={form.control}
                    render={({ field }) => {
                      return (
                        <div className="flex flex-col gap-4 p-2">
                          <div className="font-bold">
                            Upload Field (optional)
                          </div>
                          <UploadDropzone
                            containerClassName="!grow-0 border bg-white rounded-3xl p-9"
                            name="upload file"
                            title="Choose file(s)"
                            subtitle="Add certificates, photos, or links that show your work."
                            onDrop={(file) => field.onChange(file)}
                          />
                          <p className="text-skpurple font-semibold text-sm text-right">
                            You can also upload supporting files (PDF, JPG,
                            DOCX). 🛈
                          </p>
                        </div>
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!watchValue}
            onClick={() => setAchivementsLength((value) => value + 1)}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-white rounded-full border border-gray-300 text-black shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="text-xl">＋</span> Add Other Achievement
          </button>
        </>
      );
    },
  ],
  [
    "Tell Us Your Story",
    "Your honesty helps us and the community understand your real needs. Your story is how trust begins.",
    () => {
      const { form } = applicantSubmitPageState.use();
      return (
        <>
          <Controller
            name="financialSituation"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Input
                  type="text"
                  placeholder="e.g., I support my own living cost through part-time work."
                  label="Describe Your Financial Situation"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!fieldState?.error}
                  helperText={fieldState?.error?.message}
                  note="Help us understand your current economic condition and why you need support."
                />
              );
            }}
          />
          <Controller
            name="whyThisMatterToApplicant"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Input
                  type="text"
                  placeholder="e.g., This scholarship will help me pay my tuition."
                  label="Why This Scholarship Matters to You"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!fieldState?.error}
                  helperText={fieldState?.error?.message}
                  note="What will this scholarship help you achieve? Tell us your hopes and goals."
                />
              );
            }}
          />
          <Controller
            name="introduceYourselftThroughVideo"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Input
                  type="input"
                  placeholder="Paste link to your video (YouTube, Vimeo, IPFS) e.g., https://youtu.be/yourstoryhere"
                  label="Introduce yourself through a short video"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!fieldState?.error}
                  helperText={fieldState?.error?.message}
                />
              );
            }}
          />
        </>
      );
    },
  ],
  [
    "Plan Milestones",
    "Break down how you’ll use the scholarship—clear, fair, and goal-oriented.",
    () => {
      const { form, scholarshipData } = applicantSubmitPageState.use();
      const fieldMilestone = useFieldArray({
        name: "milestones",
        control: form.control,
      });

      const handleAddMilestone = () => {
        const current = form.getValues("milestones") || [];

        const next = [...current, { description: "", amount: "0", type: "" }];

        if (scholarshipData.milestoneType === "FIXED") {
          const totalAmount =
            scholarshipData.totalFund / (scholarshipData.totalRecipients || 1);
          const perMilestone = totalAmount / next.length;

          const updatedMilestones = next.map((m) => ({
            ...m,
            amount: String(perMilestone),
          }));

          fieldMilestone.replace(updatedMilestones);
          // trigger('milestones');
        } else {
          fieldMilestone.append({ description: "", amount: "0", type: "" });
        }
      };

      const recalculateMilestones = (
        milestones: ApplicantSchema["milestones"],
        fixed = false
      ) => {
        if (!fixed) return milestones;

        const totalAmount =
          scholarshipData.totalFund / (scholarshipData.totalRecipients || 1);
        const perMilestone = totalAmount / milestones?.length;

        return milestones.map((m) => ({
          ...m,
          amount: String(perMilestone),
        }));
      };

      const handleRemoveMilestone = (i: number) => {
        const current = form.getValues("milestones") || [];
        current.splice(i, 1);
        const updated = recalculateMilestones(
          current,
          scholarshipData.milestoneType === "FIXED"
        );
        fieldMilestone.replace(updated);
      };

      const { rate } = useTokenRate();

      return (
        <>
          {fieldMilestone.fields.map((_, index) => (
            <div
              key={index}
              className="flex flex-col bg-skbw rounded-xl w-full relative gap-4 p-4"
            >
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">
                  Milestone {index + 1}
                </div>
                {fieldMilestone.fields.length > 1 &&
                  scholarshipData.milestoneType !== "FIXED" && (
                    <button
                      onClick={() => handleRemoveMilestone(index)}
                      className="text-skred text-sm hover:underline"
                    >
                      Remove
                    </button>
                  )}
              </div>
              {/* <Input
                type="dropdown"
                label="Milestone Type"
                placeholder="Select a category"
                note="What category does this milestone fall under?"
                options={[
                  { label: "Tuition Fee", value: "tuition" },
                  { label: "Equipment", value: "equipment" },
                  { label: "Living Cost", value: "cost" },
                  { label: "Project", value: "project" },
                  { label: "Other", value: "other" },
                ]}
              /> */}
              <Controller
                name={`milestones.${index}.description`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    isDisabled={scholarshipData.milestoneType === "FIXED"}
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
                defaultValue=""
                name={`milestones.${index}.amount`}
                control={form.control}
                render={({ field, fieldState }) => {
                  const idrValue = usdcToIdr(
                    Number(field.value || 0),
                    rate || undefined
                  ).toFixed(0);

                  return (
                    <Input
                      isDisabled={scholarshipData.milestoneType === "FIXED"}
                      type="input"
                      label={`Requested Amount (Rp)`}
                      placeholder="e.g., Rp 3,000,000"
                      value={String(idrValue)}
                      onChange={(values) => {
                        const idr = Number(values) || 0;
                        const usdc = idrToUsdc(idr, rate || undefined);
                        field.onChange(String(usdc));
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      note="How much do you need for this specific milestone?"
                      isCurrency
                    />
                  );
                }}
              />
            </div>
          ))}
          <Controller
            name={`milestones.0.amount`}
            control={form.control}
            render={() => {
              const totalSpend = form
                .getValues("milestones")
                .reduce((a, b) => a + parseFloat(b.amount), 0);
              return (
                <div className="z-10 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black p-2 rounded-lg">
                  <CurrencyConverter
                    programType={scholarshipData.milestoneType}
                    exchangeRate={rate || 16000}
                    usdAmount={scholarshipData.totalFund || 1}
                    totalParticipant={scholarshipData.totalRecipients || 1}
                    participantSpend={totalSpend * 1000000}
                  />
                </div>
              );
            }}
          />
          <button
            type="button"
            onClick={handleAddMilestone}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-white rounded-full border border-gray-300 text-black shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="text-xl">＋</span> Add Other Achievement
          </button>
        </>
      );
    },
  ],
] as const;

export function ScholarshipApplicantSubmitPage() {
  useReplaceRootClass({
    oldClassList: ["bg-skbw", "overflow-x-hidden"],
    newClassList: ["bg-skgreen"],
  });
  const { scholarshipData: rawScholarshipData } = useSearch({
    from: "/scholarships/$id/applicant-submit",
  });
  const scholarshipData = useMemo(
    () => JSON.parse(rawScholarshipData) as ScholarshipType,
    [rawScholarshipData]
  );
  const provider = applicantSubmitPageState.init(scholarshipData);

  const totalUSDC = formatUSDC(scholarshipData.totalFund);

  return (
    <div
      className="mx-9 min-h-screen mb-9 rounded-3xl bg-black bg-contain p-9 text-white flex flex-col gap-5 max-md:mx-3 max-md:p-3 max-sm:text-sm"
      style={{
        backgroundImage: "url('/img/applicant-backdrop.png')",
      }}
    >
      <div className="text-[#6E7C87] flex gap-2 items-center">
        <Link
          className="p-4 bg-white rounded-2xl max-sm:p-2"
          to="/scholarships"
        >
          <img src="/icons/arrow-left.svg" className="max-sm:size-4" />
        </Link>
        Scholarship <ChevronRight />{" "}
        <span className="text-white">{scholarshipData.name}</span>
      </div>
      <div className="flex justify-between items-start max-sm:flex-col max-sm:gap-3">
        <span className="font-paytone text-5xl max-sm:text-3xl">
          {scholarshipData.name}
        </span>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-5">
            <span>Total Fund:</span>
            <span className="font-bold flex gap-2">
              <span>{formatCurrency(totalUSDC, "USD")} USDC</span> /
              <StudentIcon />
            </span>
          </div>
          <div className="flex justify-end gap-2 items-center">
            <InformationDiamond />
            worth around{" "}
            <span className="font-bold">
              {formatCurrency(usdToIdr(totalUSDC), "IDR")} IDR
            </span>
          </div>
        </div>
      </div>
      <div className=" flex gap-2">
        <img alt="provider-icon" src="/icons/provider-icon.svg" className="" />
        {scholarshipData.name}
      </div>
      <div className="">{scholarshipData.description}</div>

      {/* THE MAIN MODAL */}
      <applicantSubmitPageState.provider value={provider}>
        <LayoutStep>
          {steps[provider.step - 1][0]}
          {steps[provider.step - 1][1]}
          {steps[provider.step - 1][2]}
        </LayoutStep>
      </applicantSubmitPageState.provider>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="16"
      viewBox="0 0 12 16"
      fill="none"
    >
      <path d="M4 3.5L8.5 8L4 12.5" stroke="#B0BABF" />
    </svg>
  );
}

function InformationDiamond() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
    >
      <path
        d="M7.16659 4.22878V3.77124C7.16659 3.22625 7.16659 2.95374 7.06509 2.70872C6.96359 2.46369 6.77092 2.271 6.38555 1.88563L6.11429 1.61439C5.72892 1.22902 5.53625 1.03633 5.29122 0.934837C5.04619 0.833344 4.77369 0.833344 4.22869 0.833344H3.77115C3.22616 0.833344 2.95365 0.833344 2.70863 0.934837C2.4636 1.03633 2.27091 1.22902 1.88554 1.61439L1.6143 1.88563C1.22893 2.271 1.03624 2.46369 0.934745 2.70872C0.833252 2.95374 0.833252 3.22625 0.833252 3.77124V4.22878C0.833252 4.77378 0.833252 5.04628 0.934745 5.29131C1.03624 5.53634 1.22893 5.72901 1.6143 6.11438L1.88554 6.38564C2.27091 6.77101 2.4636 6.96368 2.70863 7.06518C2.95365 7.16668 3.22616 7.16668 3.77115 7.16668H4.22869C4.77369 7.16668 5.04619 7.16668 5.29122 7.06518C5.53625 6.96368 5.72892 6.77101 6.11429 6.38564L6.38555 6.11438C6.77092 5.72901 6.96359 5.53634 7.06509 5.29131C7.16659 5.04628 7.16659 4.77378 7.16659 4.22878Z"
        stroke="white"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 5.33334V3.83334"
        stroke="white"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 2.67057V2.66724"
        stroke="white"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StudentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
    >
      <path
        d="M15.8332 4.66666L9.99984 2.16666L4.1665 4.66666L7.08317 5.91666V7.58332C7.08317 7.58332 8.0554 7.16666 9.99984 7.16666C11.9443 7.16666 12.9165 7.58332 12.9165 7.58332V5.91666L15.8332 4.66666ZM15.8332 4.66666V7.99999"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.9168 7.58334V8.41668C12.9168 10.0275 11.611 11.3333 10.0002 11.3333C8.38933 11.3333 7.0835 10.0275 7.0835 8.41668V7.58334"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.48531 14.4194C5.56832 14.9899 3.16406 16.1545 4.62841 17.6119C5.34375 18.3238 6.14044 18.8329 7.14207 18.8329H12.8576C13.8593 18.8329 14.6559 18.3238 15.3713 17.6119C16.8356 16.1545 14.4313 14.9899 13.5143 14.4194C11.3641 13.0819 8.63559 13.0819 6.48531 14.4194Z"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
