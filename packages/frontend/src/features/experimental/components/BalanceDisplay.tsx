import { formatEther } from 'viem';

interface BalanceDisplayProps {
  balance: bigint;
  currency?: string;
}

const BalanceDisplay = ({ balance, currency = 'ETH' }: BalanceDisplayProps) => {
  const formatBalance = (amount: bigint) => {
    const formatted = amount ? Number(formatEther(amount)).toFixed(2) : '0.00';

    return formatted;
  };

  const getLocalValue = (amount: bigint) => {
    const eth = typeof amount === 'bigint' ? Number(formatEther(amount)) : amount;

    const ethToIDR = 32000000;
    return (eth * ethToIDR).toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="text-center space-y-2">
      <div className="space-y-1 grid grid-cols-2">
        <div className="text-4xl font-bold text-gray-800">
          {formatBalance(balance)} <span className="text-2xl text-gray-600">{currency}</span>
        </div>
        <div className="text-lg text-gray-500">≈ {getLocalValue(balance)}</div>
      </div>
    </div>
  );
};

export default BalanceDisplay;
