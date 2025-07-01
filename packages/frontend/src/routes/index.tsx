import { createFileRoute } from "@tanstack/react-router";
import SplitText from "../components/ui/split-text";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid grow text-5xl relative">
      <div
        className="absolute right-0 left-0 bg-skyellow bottom-0 h-50"
        style={{
          clipPath: "ellipse(60% 100% at 50% 100%)",
        }}
      ></div>
      <img
        src="/flower.png"
        alt="flower"
        className="left-0 -translate-x-1/4 absolute"
      />
      <img
        src="/party.png"
        alt="party"
        className="right-0 translate-x-1/4 absolute"
      />
      <img
        src="/pov-kiri.png"
        alt="pov-kiri"
        className="-left-10 absolute top-0 bottom-0 my-auto rotate-6"
      />

      <div className="font-paytone flex flex-col items-center gap-6 mt-30">
        <SplitText
          text="Empower the Future."
          delay={100}
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
          delay={100}
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
          All scholarships are powered by smart contracts. Funds go directly to
          students, no middlemen.
        </div>
      </div>
    </div>
  );
}
