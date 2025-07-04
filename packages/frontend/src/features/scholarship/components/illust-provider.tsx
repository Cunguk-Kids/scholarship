import gsap from "gsap";
import { useEffect, useRef } from "react";

export function IllustProvider() {
  const imgRef = useRef<HTMLImageElement>(null);
  const isMounted = useRef(false);
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    gsap.from(el, { x: "-100%", rotate: "0deg" });
    gsap
      .to(el, {
        x: "-10%",
        ease: "bounce.out",
        rotate: "10deg",
        duration: 2,
        delay: 1,
      })
      .then(() => {
        isMounted.current = true;
      });
  }, []);
  return (
    <div
      className="left-0 absolute top-0 bottom-0 my-auto h-max w-max"
      onMouseMove={(e) => {
        const el = imgRef.current;
        if (!el || !isMounted.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        gsap.to(el, {
          x: `${e.clientX - rect.left - rect.width / 2}px`,
          y: `${e.clientY - rect.top - rect.height / 2}px`,
          rotate: "0deg",
        });
      }}
      onMouseLeave={() => {
        const el = imgRef.current;
        if (!el || !isMounted.current) return;
        gsap.to(el, {
          x: `-10%`,
          y: 0,
          rotate: "10deg",
        });
      }}
    >
      <img
        ref={imgRef}
        src="/pov-kiri.png"
        alt="pov-kiri"
        className="block pointer-events-none"
      />
    </div>
  );
}
