import { formatToUSD, getLocalValue } from '@/util/localCurrency';

interface CurrencyConverterProps {
  usdAmount: number;
  onAmountChange?: (amount: number) => void;
  exchangeRate: number;
  totalParticipant: number;
  participantSpend: number;
}

export const CurrencyConverter = ({
  usdAmount,
  exchangeRate,
  totalParticipant,
  participantSpend,
}: CurrencyConverterProps) => {
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = parseFloat(e.target.value) || 0;

  //   if (onAmountChange) {
  //     onAmountChange(value);
  //   }
  // };

  return (
    <>
      <div className="px-4  ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Total Budget</p>
            <p className="font-bold text-gray-800">{formatToUSD(usdAmount)}</p>
            <p>{getLocalValue(usdAmount, exchangeRate * 1_000_000)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Each Participants</p>
            <p className="font-bold text-gray-800">{formatToUSD(usdAmount / totalParticipant)}</p>
            <p>{getLocalValue(usdAmount / totalParticipant, exchangeRate * 1_000_000)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Participants</p>
            <p className="font-bold text-gray-800">{totalParticipant} people</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Exchange Rate</p>
            <p className="font-bold text-gray-800">{exchangeRate.toLocaleString('id-ID')} IDR</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Your Spend</p>
            <p className="font-bold text-gray-800">
              {getLocalValue(participantSpend, exchangeRate * 1_000_000)} IDR
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Your Spend</p>
            <p className="font-bold text-gray-800">
              {getLocalValue(
                usdAmount / totalParticipant - participantSpend,
                exchangeRate * 1_000_000,
              )}
              IDR
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
