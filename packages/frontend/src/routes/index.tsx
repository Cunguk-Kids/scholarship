import { createFileRoute } from "@tanstack/react-router";
import SplitText from "../components/ui/split-text";
import { Button } from "../components/Button";
import { Tabbing } from "../components/Tabbing";
import { Flower } from "../components/ornaments/flower";
import { Party } from "../components/ornaments/party";
import { IllustProvider } from "../components/ornaments/illust-provider";
import { IllustStudent } from "../components/ornaments/illust-student";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
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
  }, []);
  return (
    <div
      ref={ref}
      className="absolute right-0 left-0 flex bg-skyellow bottom-0 h-50"
      style={{
        clipPath: "ellipse(60% 100% at 50% 100%)",
      }}
    >
      <div className="flex flex-col w-max gap-6 mt-auto flex-wrap items-center mx-auto mb-10">
        <p className="col-span-2 text-2xl grow font-bold">
          Looking for a fair, transparent way to fund your education?
        </p>
        <div className="flex gap-5 [&>*]:w-[310px] [&>*>*>button]:w-[310px] [&>*>*>button]:justify-center">
          <Button label="Open Scholarships" />
          <Button label="Explore Scholarships" />
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  return (
    <>
      <div className="grid grow text-5xl relative h-[calc(100vh-162.4px)]">
        <Bottom />
        <Flower />
        <Party />
        <IllustProvider />
        <IllustStudent />

        <div className="font-paytone flex flex-col items-center gap-6 mt-30">
          <SplitText
            text="Empower the Future."
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
          <SplitText
            text="or Be Empowered."
            delay={150}
            duration={0.6}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-99px"
            textAlign="center"
          />
          <div className="text-xl font-nunito w-110 text-center">
            <SplitText
              text="All scholarships are powered by smart contracts. Funds go directly to students, no middlemen."
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
          </div>
        </div>
      </div>
      <div
        className="h-screen p-8 place-content-center"
        style={{
          backgroundImage: `linear-gradient(
        var(--color-skyellow) 50%,
        var(--color-skbw) 50%
        )`,
        }}
      >
        <div className="gap-6 flex flex-col mx-auto w-max">
          <div className="flex flex-col gap-6">
            <h2 className="font-paytone text-5xl">Find a Scholarship...</h2>
            <p className="text-2xl">Your Next Opportunity Starts Here</p>
          </div>
          <div className="w-max">
            <Tabbing />
          </div>
        </div>
      </div>
    </>
  );
}
