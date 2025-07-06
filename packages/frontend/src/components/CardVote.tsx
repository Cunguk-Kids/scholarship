/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';

export const CardVote = ({
  name = 'Alma',
  institution = 'Universitas Indonesia',
  onSubmit = (a: any, b: any) => null,
}: {
  name?: string;
  institution?: string;
  onSubmit?: (a: any, b: any) => any;
}) => {
  return (
    <div className="relative flex bg-black rounded-2xl py-4 px-6 justify-center items-center gap-2.5 flex-1">
      <div className=" -left-3.5 -top-3.5 flex p-6 flex-col justify-center items-center gap-6 bg-white border rounded-2xl w-full h-full">
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
            <StatusBadge status="PDDIKTI" />
          </div>
          <div className="flex flex-col items-start gap-1 self-stretch">
            <p className="text-xs">Milestone Plan:</p>
            <div className="flex flex-col items-start gap-2 self-stretch">
              <img src="/img/milestone-plan.svg" alt="milestone" />
            </div>
          </div>
        </div>
        <Button label="Vote" onClick={onSubmit} />
      </div>
    </div>
  );
};
