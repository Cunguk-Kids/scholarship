import { createFileRoute } from "@tanstack/react-router";
import { Orbits } from "../components/ornaments/orbits";
import { useEffect, useRef } from "react";
import { Button } from "../components/Button";
import gsap from "gsap";
import { Hands } from "../components/ornaments/hands";
import SplitText from "../components/ui/split-text";
import { BoxVote } from "../components/ornaments/box-vote";
import { Computer } from "../components/ornaments/compputer";

export const Route = createFileRoute("/vote")({
  component: RouteComponent,
});

function Bottom() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: "100%" },
      { opacity: 1, y: "0%", duration: 2, ease: "power3.out" }
    );
    gsap.fromTo(
      ref.current.getElementsByClassName("box"),
      {
        y: "100%",
      },
      { y: "-50%", duration: 2 }
    );
  }, []);
  return (
    <div ref={ref} className="h-50">
      <div className="flex h-full relative before:bg-skgreen before:absolute before:inset-0 isolate before:-z-1 before:[clip-path:_ellipse(60%_100%_at_50%_100%)] justify-center">
        <div className="absolute top-0 left-6 box">
          <BoxVote />
        </div>
        <div className="absolute top-0 right-6 box">
          <Computer />
        </div>
        <div className="flex flex-col w-max gap-2 flex-wrap items-center mb-10">
          <div className="-translate-y-1/2">
            <Button label="Open Scholarships" />
          </div>
          <p className="col-span-2 text-2xl grow font-bold">
            Looking for a fair, transparent way to fund your education?
          </p>
        </div>
      </div>
    </div>
  );
}

function Choose() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      {
        alpha: 0,
        y: 20,
      },
      {
        duration: 1,
        alpha: 1,
        y: 0,
      }
    );
  }, []);
  return (
    <div
      ref={ref}
      className="inline-flex relative px-2 pb-4 pt-2 rotate-3 before:bg-white before:inset-0 before:px-2 before:absolute before:pb-4 before:pt-2 before:rounded-xl after:bg-black after:absolute after:inset-0 after:rounded-xl after:-z-2 rounded-xl before:border-2 isolate hover:before:translate-0 before:-translate-2 before:content-['choose'] before:transition-transform"
    >
      choose
    </div>
  );
}

function RouteComponent() {
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
      <div className="bg-skgreen h-[calc(100vh+2.5rem)] z-1"></div>
      <div className="bg-skbw h-[60vh] z-2">
        <div className="bg-black h-full rounded-xl mx-[35px] -mt-10 grid place-content-center gap-6">
          <h2 className="text-white text-7xl font-paytone">Choose with heart.</h2>
          <h2 className="text-white text-7xl font-paytone">Decide with care.</h2>
          <p className="text-white font-nunito text-xl">Let’s help the right student get the support they truly need.</p>
          <Button label="Cast Your Vote" />
        </div>
        
      </div>
    </>
  );
}
