import gsap from "gsap";
import { useEffect, useRef } from "react";

export function Flower() {
  const imgRef = useRef<HTMLImageElement>(null);
  const isMounted = useRef(false);
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    gsap.from(el, { x: "-100%", rotate: "90deg" });
    gsap
      .to(el, { x: "-25%", ease: "bounce.out", rotate: "0deg", duration: 2 })
      .then(() => {
        isMounted.current = true;
      });
  }, []);
  return (
    <div
      className="left-0 absolute"
      onMouseMove={(e) => {
        const el = imgRef.current;
        if (!el || !isMounted.current) return;
        gsap.to(el, {
          x: `${e.clientX - 50}px`,
          y: `${e.clientY - 250}px`,
          rotate: "90deg",
        });
      }}
      onMouseLeave={() => {
        const el = imgRef.current;
        if (!el || !isMounted.current) return;
        gsap.to(el, {
          x: `-25%`,
          y: 0,
          rotate: "0deg",
        });
      }}
    >
      <img
        ref={imgRef}
        src="/flower.png"
        alt="flower"
        className="block pointer-events-none"
      />
    </div>
  );
}
