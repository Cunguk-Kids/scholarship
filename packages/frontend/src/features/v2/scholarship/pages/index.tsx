/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { ScholarshipModal } from "../components/ScholarshipModal";
import { ApplicantModal } from "../components/ApplicantModal";
import { Tabbing } from "@/components/Tabbing";
import { tabbingData } from "../constants/ScholarshipConstants";
import SplitText from "@/components/ui/split-text";
import { ApproachableWrapper } from "@/components/ornaments/approachable-wrapper";
import { useProgramsV2 } from "@/hooks/v2/data/usePrograms";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useTokenRate } from "@/context/token-rate-context";
import { useSSE } from "@/hooks/v2/use-sse";
const messages = [
  "Looking for a fair, transparent way to fund your education?",
  "Ready to turn your funds into real student success stories?",
];

const Title = memo(function Title() {
  return (
    <div className="z-20 max-lg:text-4xl max-sm:text-[32px]">
      <h1>
        <SplitText
          text="Empower the Future."
          delay={200}
          duration={0.6}
          ease="power3.out"
          splitType="words"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
        />
      </h1>
      <h1>
        <SplitText
          text="or Be Empowered."
          delay={200}
          duration={0.6}
          ease="power3.out"
          splitType="words"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-99px"
          textAlign="center"
        />
      </h1>
      <div className="font-nunito text-2xl max-sm:text-sm">
        <SplitText
          text="All scholarships are powered by smart contracts. "
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
        <br />
        <SplitText
          text="Funds go directly to students, no middlemen."
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
  );
});

export const ScholarshipsPage = () => {
  const ref = useRef<HTMLDivElement>(null);
  // hooks sse
  const { data: main } = useSSE<{ step: string; percent: number }>({
    url: `${import.meta.env.VITE_BACKEND_HOST}/sse`,
    event: "main",
  });

  useEffect(() => {
    console.log(main, "-----main-----");
  }, [main]);

  const { data } = useProgramsV2();
  const { rate } = useTokenRate();

  const [openScholarshipModal, setOpenScholarshipModal] = useState(false);
  const [programId, setProgramId] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [program, setProgram] = useState<Record<string, any>>({});

  const [messagesIndex, setMessagesIndex] = useState(0);
  const [prevMessagesIndex, setPrevMessagesIndex] = useState<number | null>(
    null
  );

  const handleApplyNow = (id: string, item: Record<string, any>) => {
    setProgramId(id);

    console.log(program, "----program----");
    setProgram(item);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevMessagesIndex(messagesIndex);
      setMessagesIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messagesIndex]);

  useClickOutside(ref, () => setOpenScholarshipModal(!open));

  return (
    <>
      <div className="w-screen h-auto flex flex-col">
        <div className="">
          <div className="flex flex-col m-16 max-lg:mx-0 max-lg:mt-0 items-center gap-6 font-paytone text-[3.5rem] text-center">
            <Title />
          </div>
        </div>
        <div className="h-0">
          <div className="relative z-10 -top-80 max-lg:-top-40 max-sm:-top-0">
            <div className="flex justify-between relative max-sm:-top-20">
              <ApproachableWrapper className="relative -left-8 w-[8.625rem] h-40 max-sm:w-[117.277px] max-sm:h-[130px]">
                <img
                  src="/img/Flower.svg"
                  alt="flower"
                  className="w-full h-full"
                />
              </ApproachableWrapper>

              <ApproachableWrapper className="relative -right-1">
                <img
                  src="/img/Party.svg"
                  alt="party"
                  className="max-sm:size-[117px]"
                />
              </ApproachableWrapper>
            </div>
            <div className="relative -top-36 flex w-full justify-between max-sm:-top-36">
              <ApproachableWrapper className="relative -left-1">
                <img
                  className="max-sm:size-[180px]"
                  src="/img/Illustration Provider.svg"
                  alt="Illustration Provider"
                />
              </ApproachableWrapper>
              <ApproachableWrapper className="relative -right-1">
                <img
                  className="max-sm:size-[180px]"
                  src="/img/Illustration Student.svg"
                  alt="Illustration Student"
                />
              </ApproachableWrapper>
            </div>
          </div>
          <div className="relative z-1 -top-150 max-sm:-top-40">
            <img
              src="/img/Ellipse 1.svg"
              alt="ellipse 1"
              className="w-screen"
            />
            <div className="relative w-screen -top-1 bg-skyellow h-[33rem]"></div>
          </div>
        </div>
        <div className="relative z-10 inline-flex flex-col items-center justify-center gap-5 m-44 max-sm:m-0 max-sm:mt-50">
          <div className="relative h-12 w-full flex justify-center items-center overflow-hidden text-2xl max-sm:text-sm">
            {prevMessagesIndex !== null && (
              <span
                key={`prev-${prevMessagesIndex}`}
                className="absolute font-bold text-center animate-slideDown-fadeOut"
              >
                {messages[prevMessagesIndex]}
              </span>
            )}
            <span
              key={`curr-${messagesIndex}`}
              className="absolute font-bold text-center animate-slideUp-fadeIn"
            >
              {messages[messagesIndex]}
            </span>
          </div>
          <div className="flex items-center justify-center gap-7 self-stretch [&_button]:max-sm:text-sm max-sm:flex-col max-sm:gap-4">
            <Button
              label="Open Scholarships"
              size="large"
              onClick={() => setOpenScholarshipModal(true)}
            />
            <Button
              label="Explore Scholarships"
              size="large"
              onClick={() => {
                const section = document.getElementById("find-scholarship");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
          </div>
        </div>
        <div id="find-scholarship" className="px-9 py-12 z-2 max-sm:px-3">
          <div className="inline-flex flex-col justify-center items-start gap-3.5">
            <h2 className="font-paytone text-5xl max-sm:text-[24px]">Find a Scholarship...</h2>
            <p className="text-2xl max-sm:text-xs">Your Next Opportunity Starts Here</p>
          </div>
          <div className="py-7">
            <Tabbing
              programs={
                data?.map((x) => {
                  // @ts-expect-error ytta
                  x.endDate = new Date(x.endAt ?? "").getTime();
                  // @ts-expect-error ytta
                  x.startDate = new Date(x.startAt ?? "").getTime();
                  // @ts-expect-error ytta
                  x.initiatorAddress = x.creator;
                  return x;
                }) as never
              }
              tabs={tabbingData}
              onClickTabbing={() => {}}
              onClickButtonItem={handleApplyNow}
            />
          </div>
        </div>
      </div>

      <ScholarshipModal
        ref={ref}
        isOpen={openScholarshipModal}
        onClose={() => setOpenScholarshipModal(false)}
        rate={rate || 1}
      />

      <ApplicantModal
        ref={ref}
        programId={programId}
        isOpen={Boolean(programId)}
        onClose={() => setProgramId("")}
        programAmount={program.totalFund || 0}
        totalParticipant={program.totalRecipients || 1}
        rate={rate || 1}
        programType={program.milestoneType}
        milestones={JSON.parse(program.milestonesProgram || "[]") || []}
      />
    </>
  );
};
