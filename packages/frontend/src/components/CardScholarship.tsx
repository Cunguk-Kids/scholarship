import { Button } from "./Button";
import { StatusBadge } from "./StatusBadge";

const getTextSize = (size: string, base: string, small: string) =>
  size === "small" ? small : base;

const getImageSizeClass = (size: string) =>
  size === "small" ? "w-7 h-7 border" : "w-12 h-12 border-4";

export const CardScholarship = ({
  withButton = true,
  labelButton = "Apply Now",
  onClickButton = () => {},
  sizeButton = "large",
  size = "large",
  title = "Scholarship Title",
  provider = "Provider",
  status = "active",
  timeLeft = "00 d: 00 hr: 00 min",
  applicantQuota = "0",
  withTotalApplicant = true,
  totalApplicant = "0",
  tokenValue = "0",
  tokenCcy = "MON",
  converter = "0",
  converterCcy = "IDR",
}) => {
  return (
    <div className="flex flex-col items-center font-nunito">
      <div className="bg-black rounded-3xl">
        <div className="relative -left-2 -top-2">
          <div className="inline-flex flex-col items-start rounded-3xl border bg-white">
            {/* Card Content */}
            <div className="flex flex-col p-6 items-start gap-4">
              {/* Title */}
              <div className="flex flex-col gap-4 self-stretch">
                <div className="flex items-center gap-6">
                  <h3
                    className={`font-bold ${getTextSize(size, "text-2xl", "text-base")}`}
                  >
                    {title}
                  </h3>
                  <StatusBadge status={status} size={size} />
                </div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <img src="/icons/provider-icon.svg" alt="provider-icon" />
                  <p className={getTextSize(size, "text-base", "text-xs")}>
                    {provider}
                  </p>
                </div>
              </div>

              {/* Info: Time & Quota */}
              <div className="flex items-start gap-4 self-stretch">
                <div className="flex flex-col gap-1">
                  <p className={getTextSize(size, "text-sm", "text-xs")}>
                    Registration close in...
                  </p>
                  <div className="flex gap-2 py-2 px-3 items-center rounded-2xl border bg-skred">
                    <img src="/icons/alarm-clock.svg" alt="clock-icon" />
                    <span
                      className={getTextSize(
                        size,
                        "text-sm",
                        "text-[0.625rem]"
                      )}
                    >
                      {timeLeft}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className={getTextSize(size, "text-sm", "text-xs")}>
                    Eligible for
                  </p>
                  <div className="flex gap-2 py-2 px-3 items-center rounded-2xl border bg-skyellow">
                    <img src="/icons/student.svg" alt="student-icon" />
                    <span
                      className={getTextSize(
                        size,
                        "text-sm",
                        "text-[0.625rem]"
                      )}
                    >
                      {applicantQuota} Uni Students*
                    </span>
                  </div>
                  <p
                    className={`self-stretch text-right ${getTextSize(size, "text-xs", "text-[0.625rem]")}`}
                  >
                    *verified via PDDIKTI
                  </p>
                </div>
              </div>

              {/* Total Applicants */}
              {withTotalApplicant && (
                <div className="flex items-center gap-2 self-stretch">
                  <div className="flex items-center">
                    {["1", "2", "3"].map((n, i) => (
                      <img
                        key={n}
                        src={`/icons/applicant${n}.png`}
                        alt={`applicant-${n}`}
                        className={`${getImageSizeClass(size)} aspect-square rounded-full ${
                          i === 1 ? "-mx-3 z-1" : "z-2"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm">
                    + {totalApplicant} other students have applied
                  </p>
                </div>
              )}
            </div>

            {/* Total Fund */}
            <div className="rounded-b-3xl flex h-20 p-4 items-center gap-4 self-stretch bg-skpink">
              <div className="flex flex-col justify-end items-end gap-1">
                <div className="flex justify-end items-start gap-2">
                  <span className={getTextSize(size, "text-sm", "text-xs")}>
                    Total Fund:
                  </span>
                  <div
                    className={`flex flex-col items-start ${size === "small" ? "gap-[0.125]" : "gap-1"}`}
                  >
                    <div className="flex items-center gap-0.5">
                      <span
                        className={`${getTextSize(size, "text-2xl", "text-base")} font-bold`}
                      >
                        {tokenValue} {tokenCcy}
                      </span>
                      <p className={getTextSize(size, "text-sm", "text-xs")}>
                        /
                      </p>
                      <img src="/icons/student.svg" alt="student-icon" />
                    </div>
                    <div
                      className={`flex items-start gap-1 ${getTextSize(size, "text-sm", "text-xs")}`}
                    >
                      <img src="/icons/information-diamond.svg" alt="info" />
                      <span>worth around</span>
                      <span className="font-bold">
                        {converter} {converterCcy}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Button */}
          {withButton && (
            <div
              className={`absolute w-max ${size === "small" ? "top-[14rem] left-[15.5rem]" : "top-[16.5rem] left-[18rem]"}`}
            >
              <Button
                label={labelButton}
                onClick={onClickButton}
                size={sizeButton}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
