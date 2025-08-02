import { useState } from "react";
import { Arrow } from "@/components/Arrow";
import { CardVote } from "@/components/CardVote";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useStudents } from "../hooks/use-student";
import { useVoteApplicantApiV2 } from "../hooks/use-vote-applicant";
import { useAccount } from "wagmi";
import { useTokenRate } from "@/context/token-rate-context";
import { Loader } from "@/components/fallback/loader";

type Props = {
  programId: null | number;
  onClose: () => void;
};

export const ApplicantListModal = ({ programId, onClose }: Props) => {
  // states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [applicant, setApplicant] = useState<string | null>(null);
  // hooks
  const { rate } = useTokenRate();
  const { data, isLoading } = useStudents(programId ?? 0);
  const account = useAccount();
  const voteApi = useVoteApplicantApiV2();

  if (programId == null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-11/12 relative shadow-x bg-skgreen p-10">
        <div className="my-4">
          <Arrow direction="left" onClick={onClose} />
        </div>
        <div className="flex justify-between">
          <div className="inline-flex flex-col justify-center items-start gap-3.5">
            <h1 className="font-paytone text-5xl">Applicants</h1>
            <p className="text-2xl">
              Cast your vote before the deadline closes.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-sm font-medium">Voting close in...</h3>
            <div className="flex gap-2 py-2 px-3 items-center rounded-2xl border bg-error-container border-on-error-container">
              <img src="/icons/alarm-clock.svg" alt="clock-icon" />
              <span
                className={`text-sm text-[0.625rem] text-on-error-container`}
              >
                {`00 d: 00 hr: 00 min`}
              </span>
            </div>
          </div>
        </div>
        <div className="my-10 w-full grid grid-cols-3 gap-8">
          {isLoading && (
            <div className="col-span-3 flex justify-center items-center">
              <Loader className="size-30 text-black/50" />
            </div>
          )}
          {data?.studentss.items.map((student) => (
            <CardVote
              key={student.id}
              institution={student.financialSituation ?? undefined}
              name={student.fullName ?? undefined}
              onSubmit={() => {
                setShowSubmitModal(true);
                setApplicant(student.studentAddress);
              }}
              milestones={student.milestones.items}
              rate={rate || 1}
            />
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={() => {
          setShowSubmitModal(false);
          voteApi.mutate({
            applicantAddress: applicant as `0x${string}`,
            programId: String(programId),
            voter: account.address as `0x${string}`,
          });
        }}
        title={"Choose with care!"}
        desc={`Your choice can change someone’s life \n See their story. Review their plan. Cast your vote. \n You only get one vote per scholarship. Make it count.`}
        primaryLabel={"Confirm Vote"}
        secondaryLabel={"Review Again"}
      />
    </div>
  );
};
