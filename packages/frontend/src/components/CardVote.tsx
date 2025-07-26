/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "./Button";
import { StatusBadge } from "./StatusBadge";

export const CardVote = ({
  name = "Alma",
  institution = "Universitas Indonesia",
  onSubmit = () => null,
}: {
  name?: string;
  institution?: string;
  onSubmit?: () => any;
}) => {
  const handleClickVote = () => {
    onSubmit();
  };

  return (
    <div className="flex flex-col items-start">
      <div className="flex bg-black rounded-2xl justify-center items-center gap-2.5">
        <div className="relative flex -left-2 -top-2 p-6 flex-col justify-center items-center gap-6 bg-white border rounded-2xl">
          <div className="flex flex-col items-start gap-6 flex-1 self-stretch">
            <div className="flex items-center justify-center gap-2.5 self-stretch">
              <img
                src="/peeps/peep-1.png"
                alt="profile"
                className="w-10 h-10 aspect-square rounded-full border-4"
              />
              <div className="flex flex-col justify-center items-start flex-1">
                <h1 className="font-paytone text-4xl">{name}</h1>
                <h3 className="text-xs">{institution}</h3>
              </div>
              <StatusBadge status="PDDIKTI" size="small" />
            </div>
            <div className="flex flex-col items-start gap-1 self-stretch">
              <p className="text-xs">Milestone Plan:</p>
              <div className="flex flex-col items-start gap-2 self-stretch">
                <img src="/img/milestone-plan.svg" alt="milestone" />
              </div>
            </div>
          </div>
          <Button label="Vote" onClick={handleClickVote} />
        </div>
      </div>
    </div>
  );
};
