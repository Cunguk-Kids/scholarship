import { useState } from 'react';
import { Orbits } from '@/features/v2/vote/components/Orbits';
import { Hands } from '@/features/v2/vote/components/Hands';
import { Bottom } from '@/features/v2/vote/components/Bottom';
import { Choose } from '@/features/v2/vote/components/Choose';
import SplitText from '@/components/ui/split-text';
import { Footer } from '@/features/v2/vote/components/Footer';
import { VotingList } from '@/features/v2/vote/components/VotingList';
import { ApplicantListModal } from '../components/ApplicantListModal';

export function VotePage() {
  // states
  const [programId, setProgramId] = useState<number | null>(null);
  const [programIndexerId, setProgramIndexerId] = useState<string | null>(null);

  const handleClickVote = (programId: number | null, indexId: string | null) => {
    setProgramId(programId);
    setProgramIndexerId(indexId);
  };

  return (
    <>
      <div className="flex flex-col relative h-[calc(100vh-162.4px)] w-full">
        <div className="h-max w-max pointer-events-none fixed top-0 right-0 left-0 mx-auto">
          <Hands />
        </div>
         <div className="flex flex-col items-center w-max max-md:w-fit gap-5 mx-auto z-10 my-auto max-md:my-0">
          <h2 className="font-paytone text-5xl max-md:text-4xl max-sm:text-3xl text-center">
            <SplitText
              text="Help to "
              delay={150}
              duration={0.6}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />{' '}
            <Choose />
          </h2>
          <h2 className="font-paytone text-5xl max-md:text-4xl max-sm:text-3xl text-center">
            <SplitText
              text="who deserves the chance?"
              delay={150}
              duration={0.6}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </h2>
          <p className="text-2xl w-150 text-center mt-5 max-md:w-fit">
            <SplitText
              text="Your vote isn’t just a click—it’s a chance to change someone’s future."
              delay={50}
              duration={0.6}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </p>
        </div>
        <Orbits className="absolute top-0 bottom-0 left-0 -translate-x-1/2 max-sm:hidden" />
        <Orbits className="absolute top-0 bottom-0 right-0 translate-x-1/2 max-sm:hidden" invert />

        <Bottom />
      </div>
      <div
        id="active-voting"
        className="relative w-full bg-skgreen z-1 flex flex-col items-start gap-8 shrink-0 p-12">
        <div className="inline-flex flex-col items-start justify-center gap-3.5">
          <h2 className="font-paytone text-5xl">Scholarships in Voting Phase</h2>
          <p className="text-2xl">Cast your vote before the deadline closes.</p>
        </div>
        <div className="grid grid-cols-2 gap-14 w-full mb-16 z-10 max-lg:grid-cols-1 mt-5">
          <VotingList onClickVote={handleClickVote} />
        </div>
        <div className="w-full absolute bottom-0 flex items-center justify-between -mx-12">
          <img src="/img/Fence.svg" alt="fence" />
          <img src="/img/Fence.svg" alt="fence" />
        </div>
      </div>
      <div className="z-5 w-full px-10 -mt-10 pb-8">
        <Footer />
      </div>

      {programId && (
        <ApplicantListModal
          programIndexerId={programIndexerId}
          programId={programId}
          onClose={() => setProgramId(null)}
        />
      )}
    </>
  );
}
