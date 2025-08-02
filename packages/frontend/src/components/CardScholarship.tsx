/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';
import { getProgramStatus } from '@/util/programStatus';
import { getLocalValue } from '@/util/localCurrency';

const getTextSize = (size: string, base: string, small: string) =>
  size === 'small' ? small : base;

const getImageSizeClass = (size: string) =>
  size === 'small' ? 'w-7 h-7 border' : 'w-12 h-12 border-4';

export const CardScholarship = ({
  withButton = true,
  labelButton = 'Apply Now',
  onClickButton = () => {},
  sizeButton = 'large',
  size = 'large',
  tokenCcy = 'USDC',
  program,
  liskToIDR = 0,
}: {
  size?: 'large' | 'small';
  withButton?: boolean;
  labelButton?: string;
  sizeButton?: 'small' | 'large';
  onClickButton?: () => void;
  status?: string;
  tokenValue?: string | bigint;
  tokenCcy?: string;
  totalApplicant?: number;
  program: Record<string, any>;
  liskToIDR?: number;
}) => {
  const timeLeft = getTimeLeft(program.endDate);

  const status = getProgramStatus({
    startAt: program.startAt,
    endAt: program.endAt,
  });

  return (
    <div className="flex flex-col items-center">
      <div className="bg-black rounded-3xl">
        <div className="relative -left-2 -top-2">
          <div className="inline-flex flex-col items-start rounded-3xl border bg-white">
            <div className="flex flex-col p-6 items-start gap-4">
              <div className="flex flex-col gap-4 self-stretch">
                <div className="flex items-center gap-6 justify-between">
                  <h3
                    className={`font-bold ${getTextSize(size, 'text-2xl', 'text-base')} max-w-72 truncate`}>
                    {program.name || 'Scholarship Title'}
                  </h3>
                  <StatusBadge status={status} size={size} />
                </div>
                <div className="flex items-center gap-2 font-bold text-sm max-w-90">
                  <img src="/icons/provider-icon.svg" alt="provider-icon" />
                  <p className={`${getTextSize(size, 'text-base', 'text-xs')} truncate`}>
                    {program.initiatorAddress}
                  </p>
                </div>
              </div>

              {/* Info: Time & Quota */}
              <div className="flex items-start gap-4 self-stretch justify-between">
                <div className="flex flex-col gap-1">
                  <p className={getTextSize(size, 'text-sm', 'text-xs')}>
                    Registration close in...
                  </p>
                  <div className="flex gap-2 py-2 px-3 items-center rounded-2xl border bg-error-container border-on-error-container">
                    <img src="/icons/alarm-clock.svg" alt="clock-icon" />
                    <span
                      className={`${getTextSize(size, 'text-sm', 'text-[0.625rem]')} text-on-error-container`}>
                      {timeLeft}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className={getTextSize(size, 'text-sm', 'text-xs')}>Eligible for</p>
                  <div className="flex gap-2 py-2 px-3 items-center rounded-2xl border bg-skyellow">
                    <img src="/icons/student.svg" alt="student-icon" />
                    <span className={getTextSize(size, 'text-sm', 'text-[0.625rem]')}>
                      {Number(program.totalRecipients)} Uni Students*
                    </span>
                  </div>
                  <p
                    className={`self-stretch text-right ${getTextSize(size, 'text-xs', 'text-[0.625rem]')}`}>
                    *verified via PDDIKTI
                  </p>
                </div>
              </div>

              {/* Total Applicants */}
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex items-center">
                  {[1, 2, 3].map((n, i) => (
                    <img
                      key={n}
                      src={`/icons/applicant${n}.png`}
                      alt={`applicant-${n}`}
                      className={`${getImageSizeClass(size)} aspect-square rounded-full ${
                        i === 1 ? '-mx-3 z-2' : i === 0 ? `z-5` : `-z-${i + 1}`
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm">
                  + {program?.totalRecipients?.result || 0} other students have applied
                </p>
              </div>
            </div>

            {/* Total Fund */}
            <div className="rounded-b-3xl flex h-20 p-4 items-center gap-4 self-stretch bg-skpink">
              <div className="flex flex-col justify-end items-end gap-1">
                <div className="flex justify-end items-start gap-2">
                  <span className={getTextSize(size, 'text-sm', 'text-xs')}>Total Fund:</span>
                  <div
                    className={`flex flex-col items-start ${size === 'small' ? 'gap-[0.125]' : 'gap-1'}`}>
                    <div className="flex items-center gap-0.5">
                      <span className={`${getTextSize(size, 'text-2xl', 'text-base')} font-bold`}>
                        {program.totalFund / 1000000 || 0} {tokenCcy}
                      </span>
                      <p className={`${getTextSize(size, 'text-sm', 'text-xs')} mx-0.5`}>/</p>
                      <img src="/icons/student.svg" alt="student-icon" />
                    </div>
                    <div
                      className={`flex items-start gap-1 ${getTextSize(size, 'text-sm', 'text-xs')}`}>
                      <img src="/icons/information-diamond.svg" alt="info" />
                      <span>worth around</span>
                      <span className="font-bold">
                        {getLocalValue(program.totalFund as bigint, liskToIDR)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {withButton && (
            <div
              className={`absolute w-max ${size === 'small' ? 'top-[14rem] left-[15.5rem]' : 'top-[16.5rem] left-[20rem]'}`}>
              <Button label={labelButton} onClick={onClickButton} size={sizeButton} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility to calculate time left
function getTimeLeft(endTimestamp?: number | bigint): string {
  const end = typeof endTimestamp === 'bigint' ? Number(endTimestamp) : (endTimestamp ?? 0);
  const secondsLeft = Math.floor(end / 1000) - Math.floor(Date.now() / 1000);
  if (secondsLeft <= 0) return '00 d: 00 hr: 00 min';

  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);

  return `${String(days).padStart(2, '0')} d: ${String(hours).padStart(2, '0')} hr: ${String(minutes).padStart(2, '0')} min`;
}
