import { Button } from "@/components/Button";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export function Bottom() {
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
