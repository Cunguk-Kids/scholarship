import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { BoxVote } from "@/components/ornaments/box-vote";
import { Computer } from "@/components/ornaments/compputer";
import gsap from "gsap";

export function Bottom() {
  const ref = useRef<HTMLDivElement>(null);

  const messages = [
    "All votes are on-chain, secure, and transparent.",
    "One wallet, one vote per scholarship.",
  ];
  const [messagesIndex, setMessagesIndex] = useState(0);
  const [prevMessagesIndex, setPrevMessagesIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevMessagesIndex(messagesIndex);
      setMessagesIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages.length, messagesIndex]);

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
    <div ref={ref} className="h-50 max-md:mt-auto max-md:h-30">
      <div className="flex h-full relative before:bg-skgreen before:absolute before:inset-0 isolate before:-z-1 before:[clip-path:_ellipse(60%_100%_at_50%_100%)] justify-center">
        <div className="absolute top-0 left-6 box max-md:-left-20 max-sm:hidden">
          <BoxVote />
        </div>
        <div className="absolute top-0 right-6 max-sm:hidden max-md:-right-20 box">
          <Computer />
        </div>
        <div className="flex flex-col w-full gap-2 items-center">
          <div className="-translate-y-1/2">
            <Button
              label="Join Active Voting"
              size="large"
              onClick={() => {
                const section = document.getElementById("active-voting");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
          </div>
          <div className="relative h-12 w-full flex justify-center items-center overflow-hidden">
            {prevMessagesIndex !== null && (
              <span
                key={`prev-${prevMessagesIndex}`}
                className="absolute text-2xl font-bold text-center animate-slideDown-fadeOut"
              >
                {messages[prevMessagesIndex]}
              </span>
            )}
            <span
              key={`curr-${messagesIndex}`}
              className="absolute text-2xl font-bold text-center animate-slideUp-fadeIn"
            >
              {messages[messagesIndex]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
