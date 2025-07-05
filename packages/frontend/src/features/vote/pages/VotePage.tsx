import { Orbits } from "@/features/vote/components/orbits";
import { Button } from "@/components/Button";
import { Hands } from "@/features/vote/components/hands";
import { Bottom } from "@/features/vote/components/bottom";
import { Choose } from "@/features/vote/components/choose";
import SplitText from "@/components/ui/split-text";
import { VotingList } from "../components/voting-list";

export function VotePage() {
  return (
    <>
      <div className="flex flex-col relative h-[calc(100vh-162.4px)] overflow-hidden">
        <div className="h-max w-max fixed top-0 right-0 left-0 mx-auto">
          <Hands />
        </div>
        <div className="flex flex-col items-center w-max gap-5 mx-auto z-10 my-auto">
          <h2 className="font-paytone text-5xl text-center">
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
            />{" "}
            <Choose />
          </h2>
          <h2 className="font-paytone text-5xl text-center">
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
          <p className="text-2xl w-150 text-center mt-5">
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
        <Orbits className="absolute top-0 bottom-0 left-0 -translate-x-1/2" />
        <Orbits
          className="absolute top-0 bottom-0 right-0 translate-x-1/2"
          invert
        />
        <Bottom />
      </div>
      <div className="bg-skgreen min-h-[calc(100vh+2.5rem)] z-1 p-8 flex flex-col items-center gap-8">
        <div className="flex flex-col gap-6">
          <h2 className="font-paytone text-5xl">
            Scholarships in Voting Phase
          </h2>
          <p className="text-2xl">Cast your vote before the deadline closes.</p>
        </div>
        <VotingList />
      </div>
      <div className="bg-skbw h-[60vh] z-2">
        <div className="bg-black h-full rounded-xl mx-[35px] -mt-10 grid place-content-center gap-6">
          <h2 className="text-white text-7xl font-paytone">
            Choose with heart.
          </h2>
          <h2 className="text-white text-7xl font-paytone">
            Decide with care.
          </h2>
          <p className="text-white font-nunito text-xl">
            Let’s help the right student get the support they truly need.
          </p>
          <Button label="Cast Your Vote" />
        </div>
      </div>
    </>
  );
}
