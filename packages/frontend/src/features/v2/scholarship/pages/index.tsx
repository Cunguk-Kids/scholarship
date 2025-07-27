import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { ScholarshipModal } from "../components/ScholarshipModal";
import { ApplicantModal } from "../components/ApplicantModal";
import { useApplicant } from "@/hooks/@programs/applicant/use-list-applicant";
import { Tabbing } from "@/components/Tabbing";
import { tabbingData } from "../constants/ScholarshipConstants";
import SplitText from "@/components/ui/split-text";
import { ApproachableWrapper } from "@/components/ornaments/approachable-wrapper";
import { usePrograms } from "@/hooks/v2/data/usePrograms";

export const ScholarshipsPage = () => {
  const { applicants } = useApplicant("");
  const { data } = usePrograms();

  const [openScholarshipModal, setOpenScholarshipModal] = useState(false);
  const [programId, setProgramId] = useState("");

  const messages = [
    "Looking for a fair, transparent way to fund your education?",
    "Ready to turn your funds into real student success stories?",
  ];
  const [messagesIndex, setMessagesIndex] = useState(0);
  const [prevMessagesIndex, setPrevMessagesIndex] = useState<number | null>(
    null
  );

  const handleApplyNow = (id: string) => {
    setProgramId(id);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevMessagesIndex(messagesIndex);
      setMessagesIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messagesIndex]);

  return (
    <>
      <div className="w-screen h-auto flex flex-col">
        <div className="">
          <div className="flex flex-col m-16 items-center gap-6 font-paytone text-[3.5rem] text-center">
            <div className="lg:w-2xl">
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
              <p className="font-nunito text-2xl">
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
              </p>
            </div>
          </div>
        </div>
        <div className="h-0">
          <div className="relative z-10 -top-80">
            <div className="flex justify-between">
              <ApproachableWrapper className="relative -left-8 w-[8.625rem] h-40">
                <img
                  src="/img/Flower.svg"
                  alt="flower"
                  className="w-full h-full"
                />
              </ApproachableWrapper>

              <ApproachableWrapper className="relative -right-1">
                <img src="/img/Party.svg" alt="party" />
              </ApproachableWrapper>
            </div>
            <div className="relative -top-36 flex w-full justify-between">
              <ApproachableWrapper className="relative -left-1">
                <img
                  src="/img/Illustration Provider.svg"
                  alt="Illustration Provider"
                />
              </ApproachableWrapper>
              <ApproachableWrapper className="relative -right-1">
                <img
                  src="/img/Illustration Student.svg"
                  alt="Illustration Student"
                />
              </ApproachableWrapper>
            </div>
          </div>
          <div className="relative z-1 -top-150">
            <img
              src="/img/Ellipse 1.svg"
              alt="ellipse 1"
              className="w-screen"
            />
            <div className="relative w-screen -top-1 bg-skyellow h-[33rem]"></div>
          </div>
        </div>
        <div className="relative z-10 inline-flex flex-col items-center justify-center gap-5 m-44">
          {/* <div className="flex flex-col gap-2 text-2xl font-bold mx-auto">
            <p>Looking for a fair, transparent way to fund your education?</p>
            <p>Ready to turn your funds into real student success stories?</p>
          </div> */}
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
          <div className="flex items-center justify-center gap-7 self-stretch">
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
        <div id="find-scholarship" className="px-9 py-12 z-2">
          <div className="inline-flex flex-col justify-center items-start gap-3.5">
            <h2 className="font-paytone text-5xl">Find a Scholarship...</h2>
            <p className="text-2xl">Your Next Opportunity Starts Here</p>
          </div>
          <div className="py-7">
            <Tabbing
              participants={
                applicants?.[0]?.map((x) => {
                  return { participantAddress: x };
                }) as never
              }
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
            {/* <Tabbing programs={[]} /> */}
          </div>
        </div>
      </div>

      <ScholarshipModal
        isOpen={openScholarshipModal}
        onClose={() => setOpenScholarshipModal(false)}
      />

      <ApplicantModal
        programId={programId}
        isOpen={Boolean(programId)}
        onClose={() => setProgramId("")}
      />
    </>
  );
};
