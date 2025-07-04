import gsap from "gsap";
import { useEffect, useRef } from "react";

export function Orbits({ className = "", invert = false }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      {
        scaleX: invert ? 1 : -1,
      },
      {
        ease: "power3.out",
        duration: 2,
        scaleX: invert ? -1 : 1,
      }
    );
  }, [invert]);
  return (
    <div ref={ref} className={`w-max h-max ${className}`}>
      <div className="p-[60px] border-2 rounded-full border-[#1D192B]/8 relative -rotate-45">
        <img
          className="absolute right-0 bottom-0 mx-auto left-0 size-[48px] rounded-full border-3 translate-y-1/2 rotate-45"
          src="/peeps/peep-3.png"
        />
        <div className="p-[60px] border-2 rounded-full border-[#1D192B]/8 relative rotate-60">
          <img
            className="absolute right-0 top-0 mx-auto left-0 size-[48px] rounded-full border-3 -translate-y-1/2 -rotate-15"
            src="/peeps/peep-2.png"
          />
          <div className="p-[60px] border-2 rounded-full border-[#1D192B]/8 relative">
            <img
              className="absolute top-0 bottom-0 my-auto right-0 size-[48px] rounded-full border-3 translate-x-1/2 -rotate-15"
              src="/peeps/peep-1.png"
            />
            <div className="size-[100px] border-2 rounded-full border-[#1D192B]/8 "></div>
          </div>
        </div>
      </div>
    </div>
  );
}
