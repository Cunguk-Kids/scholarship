import gsap from "gsap";
import { useEffect, useRef } from "react";
export function Choose() {
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
