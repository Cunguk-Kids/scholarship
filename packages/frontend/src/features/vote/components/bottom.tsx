import { Button } from "@/components/Button";
import { BoxVote } from "@/components/ornaments/box-vote";
import { Computer } from "@/components/ornaments/compputer";
import { useEffect, useRef } from "react";
import gsap from "gsap";
export function Bottom() {
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
