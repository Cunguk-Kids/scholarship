import { formatToUSD, getLocalValue } from "@/util/localCurrency";
import { twMerge } from "tailwind-merge";
import type { AmountType } from "../validations/schemas";
import { formatUSDC } from "@/util/currency";

interface CurrencyConverterProps {
  usdAmount: number;
  onAmountChange?: (amount: number) => void;
  exchangeRate: number;
  totalParticipant: number;
  participantSpend: number;
  programType: AmountType;
}

export const CurrencyConverter = ({
  usdAmount,
  exchangeRate,
  totalParticipant,
  participantSpend,
  programType,
}: CurrencyConverterProps) => {
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = parseFloat(e.target.value) || 0;

  //   if (onAmountChange) {
  //     onAmountChange(value);
  //   }
  // };

  return (
    <>
      <div className="px-4 flex flex-col gap-y-2 ">
        <label className="italic font-bold text-sm">
          {programType === "FIXED"
            ? "The total fund will be evenly divided across all milestones. You cannot manually set the amount per milestone."
            : "You are free to define the amount for each milestone manually. Make sure the total matches the allocated fund."}
        </label>
        <div className="@container">
          <div className="grid grid-cols-3 @max-[400px]:grid-cols-2 @max-[300px]:grid-cols-1 @max-[300px]:[&>div.text-center]:text-left gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-600">Total Budget</p>
              <p className="font-bold text-gray-800">
                {formatToUSD(formatUSDC(usdAmount))}
              </p>
              <p>{getLocalValue(usdAmount, exchangeRate)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Each Participants</p>
              <p className="font-bold text-gray-800">
                {formatToUSD(formatUSDC(usdAmount / totalParticipant))}
              </p>
              <p>{getLocalValue(usdAmount / totalParticipant, exchangeRate)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Participants</p>
              <p className="font-bold text-gray-800">
                {totalParticipant} people
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Exchange Rate</p>
              <p className="font-bold text-gray-800">
                {exchangeRate.toLocaleString("id-ID")} IDR
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Your Spend</p>
              <p className="font-bold text-gray-800">
                {getLocalValue(participantSpend, exchangeRate)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Your Spend Left</p>
              <p
                className={twMerge(
                  "font-bold text-gray-800",
                  usdAmount / totalParticipant - participantSpend <= 0
                    ? "text-red-500"
                    : "text-green-500"
                )}
              >
                {getLocalValue(
                  usdAmount / totalParticipant - participantSpend,
                  exchangeRate
                )}
                IDR
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
