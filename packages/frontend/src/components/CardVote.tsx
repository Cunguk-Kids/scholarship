/* eslint-disable @typescript-eslint/no-explicit-any */
import { orderBy } from 'lodash';
import React from 'react';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';
import Timeline, { type TimelineItem } from './Timeline';
import HoverPopover from './HoverPopover'; // Import komponen baru kita
import { twMerge } from 'tailwind-merge';

export const CardVote = ({
  name = 'Alma',
  institution = 'Universitas Indonesia',
  onSubmit = () => null,
  milestones,
  rate = 1,
}: {
  name?: string;
  institution?: string;
  onSubmit?: () => any;
  milestones?: TimelineItem[];
  rate?: number;
}) => {
  const handleClickVote = () => {
    onSubmit();
  };

  const calculateAverageScore = (milestones: any[]) => {
    if (!milestones || milestones.length === 0) {
      return 0;
    }

    const totalScore = milestones.reduce((sum, item) => {
      const scoreValue = typeof item.score === 'string' ? parseInt(item.score, 10) : item.score;
      return sum + (scoreValue || 0);
    }, 0);

    const average = totalScore / milestones.length;

    return Math.round(average * 10) / 10;
  };

  const relevantContent = (
    <>
      <p>
        This profile is marked as{' '}
        {`${calculateAverageScore(milestones || []) > 7 ? 'relevant' : 'not relevant'}`} because
        score each milestone is:{' '}
        <span
          className={twMerge(
            'font-extrabold text-lg',
            calculateAverageScore(milestones || []) > 7 ? 'text-green-500' : 'text-red-500',
          )}>
          {calculateAverageScore(milestones || [])}
        </span>
      </p>
      <div className="mt-4">
        <p className="font-bold text-gray-700">Relevant Milestones:</p>
        <ul className="list-disc list-inside ml-4 mt-2">
          {orderBy(milestones || [], 'blockchainId', 'asc')
            ?.filter((item) => {
              const scoreValue = item.score ? parseInt(item.score, 10) : 0;
              return scoreValue > 7;
            })
            .map((item, index) => (
              <li key={index} className="text-gray-600">
                {item.description}
                {item.summary && ` - ${item.summary}`}
              </li>
            ))}
        </ul>
      </div>
    </>
  );

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
                <HoverPopover
                  trigger={
                    <p
                      className={twMerge(
                        'font-paytone text-xs bg-green-500 text-white p-1 rounded-md cursor-pointer',
                        calculateAverageScore(milestones || []) < 7 && 'bg-red-500',
                      )}>
                      {`${calculateAverageScore(milestones || []) > 7 ? 'Relevant' : 'Not Relevant'}`}
                    </p>
                  }
                  content={relevantContent}
                />
              </div>
              <StatusBadge status="PDDIKTI" size="small" />
            </div>
            <div className="flex flex-col items-start gap-1 self-stretch">
              <p className="text-xs">Milestone Plan:</p>
              <div className="flex flex-col items-start gap-2 self-stretch">
                <Timeline
                  items={orderBy(milestones, 'blockchainId', 'asc') || []}
                  title=""
                  rate={rate}
                />
              </div>
            </div>
          </div>
          <Button label="Vote" onClick={handleClickVote} />
        </div>
      </div>
    </div>
  );
};
