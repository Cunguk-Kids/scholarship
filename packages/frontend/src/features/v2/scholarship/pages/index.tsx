import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { ScholarshipModal } from "../components/ScholarshipModal";
import { ApplicantModal } from "../components/ApplicantModal";
import { useGetPrograms } from "@/features/scholarship/hooks/get-programs";
import { useApplicant } from "@/hooks/@programs/applicant/use-list-applicant";
import { Tabbing } from "@/components/Tabbing";
import { tabbingData } from "../constants/ScholarshipConstants";

export const ScholarshipsPage = () => {
  const { programs } = useGetPrograms();
  const { applicants } = useApplicant("");

  const [openScholarshipModal, setOpenScholarshipModal] = useState(false);
  const [openApplicantModal, setOpenApplicantModal] = useState(false);

  const messages = [
    "Looking for a fair, transparent way to fund your education?",
    "Ready to turn your funds into real student success stories?",
  ];
  const [messagesIndex, setMessagesIndex] = useState(0);
  const [prevMessagesIndex, setPrevMessagesIndex] = useState<number | null>(
    null
  );

  const handleApplyNow = (id: String) => {
    setOpenApplicantModal(true);
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
              <h1>Empower the Future.</h1>
              <h1>or Be Empowered.</h1>
              <p className="font-nunito text-2xl">
                All scholarships are powered by smart contracts.
                <br />
                Funds go directly to students, no middlemen.
              </p>
            </div>
          </div>
        </div>
        <div className="h-0">
          <div className="relative z-10 -top-80">
            <div className="flex justify-between">
              <img
                src="/img/Flower.svg"
                alt="flower"
                className="relative -left-8 w-[8.625rem] h-40"
              />

              <img
                src="/img/Party.svg"
                alt="party"
                className="relative -right-1"
              />
            </div>
            <div className="relative -top-36 flex w-full justify-between">
              <img
                src="/img/Illustration Provider.svg"
                alt="Illustration Provider"
                className="relative -left-1"
              />
              <img
                src="/img/Illustration Student.svg"
                alt="Illustration Student"
                className="relative -right-1"
              />
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
                programs?.map((x) => {
                  // @ts-expect-error ytta
                  x.programMetadataCID = x.title;
                  // @ts-expect-error ytta
                  x.endDate = new Date(x.endDate ?? "").getTime();
                  // @ts-expect-error ytta
                  x.startDate = new Date(x.startDate ?? "").getTime();
                  // @ts-expect-error ytta
                  x.programContractAddress = x.contractAddress;
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
        isOpen={openApplicantModal}
        onClose={() => setOpenApplicantModal(false)}
      />
    </>
  );
};
