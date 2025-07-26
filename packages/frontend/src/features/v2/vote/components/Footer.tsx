import { Button } from "@/components/Button";

export const Footer = () => {
  return (
    <div className="relative w-full max-h-[40rem] flex px-12 py-6 items-center gap-6 rounded-3xl bg-black justify-between overflow-clip">
      <div className="flex flex-col justify-center items-start gap-12 self-stretch">
        <div className="flex flex-col items-start gap-6 text-white ">
          <div className="flex flex-col items-start font-paytone text-5xl">
            <h2>Choose with heart.</h2>
            <h2>Decide with care.</h2>
          </div>
          <p className="text-2xl">
            Let’s help the right student get the support they truly need.
          </p>
        </div>
        <Button
          size="large"
          label="Cast Your Vote"
          bgShadow="bg-white"
          onClick={() => {
            const section = document.getElementById("active-voting");
            if (section) {
              section.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />
      </div>
      <div className="relative -mx-18">
        <img
          src="/img/Orbit-vote-footer.svg"
          alt="orbit-vote"
          className="relative right-0 top-36"
        />
        <img
          src="/img/Vote-Box.svg"
          alt="vote-box"
          className="relative right-0 bottom-34"
        />
      </div>
    </div>
  );
};
