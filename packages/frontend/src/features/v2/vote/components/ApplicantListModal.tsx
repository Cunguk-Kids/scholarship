import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Arrow } from '@/components/Arrow';
import { CardVote } from '@/components/CardVote';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useStudents } from '../hooks/use-student';
import { useVoteApplicantApiV2 } from '../hooks/use-vote-applicant';
import { useAccount } from 'wagmi';
import { useTokenRate } from '@/context/token-rate-context';
import { Loader } from '@/components/fallback/loader';
import gsap from 'gsap';

type Props = {
  programId: null | number;
  programIndexerId: null | string;
  onClose: () => void;
};

export const ApplicantListModal = ({ programIndexerId, programId, onClose }: Props) => {
  // ref
  const cardsRef = useRef<HTMLDivElement>(null);

  // states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [applicant, setApplicant] = useState<string | null>(null);
  // hooks
  const { rate } = useTokenRate();
  const { data, refetch, isFetching } = useStudents(
    programIndexerId ? { programId: programIndexerId } : {},
  );
  const account = useAccount();
  const voteApi = useVoteApplicantApiV2();

  useEffect(() => {
    if (programIndexerId) {
      refetch();
    }
  }, [programIndexerId]);

  useLayoutEffect(() => {
    if (!isFetching && cardsRef.current) {
      const cards = gsap.utils.toArray('.card-vote') as HTMLElement[];

      gsap.from(cards, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }
  }, [isFetching, data]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-11/12 relative shadow-x bg-skgreen p-10">
        <div className="my-4">
          <Arrow direction="left" onClick={onClose} />
        </div>
        <div className="flex justify-between">
          <div className="inline-flex flex-col justify-center items-start gap-3.5">
            <h1 className="font-paytone text-5xl">Applicants</h1>
            <p className="text-2xl">Cast your vote before the deadline closes.</p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-sm font-medium">Voting close in...</h3>
            <div className="flex gap-2 py-2 px-3 items-center rounded-2xl border bg-error-container border-on-error-container">
              <img src="/icons/alarm-clock.svg" alt="clock-icon" />
              <span className={`text-sm text-[0.625rem] text-on-error-container`}>
                {`00 d: 00 hr: 00 min`}
              </span>
            </div>
          </div>
        </div>
        <div ref={cardsRef} className="my-10 w-full grid grid-cols-3 gap-8">
          {isFetching && (
            <div className="w-full min-h-[280px]">
              <Loader className="absolute inset-0 m-auto size-20" />
            </div>
          )}
          {!isFetching &&
            data?.studentss.items.map((student) => (
              <div key={student.id} className="card-vote">
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
              </div>
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
        title={'Choose with care!'}
        desc={`Your choice can change someone’s life \n See their story. Review their plan. Cast your vote. \n You only get one vote per scholarship. Make it count.`}
        primaryLabel={'Confirm Vote'}
        secondaryLabel={'Review Again'}
      />
    </div>
  );
};
