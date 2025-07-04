interface BalanceDisplayProps {
  balance: number;
  currency?: string;
}

const BalanceDisplay = ({ balance, currency = 'ETH' }: BalanceDisplayProps) => {
  const formatBalance = (amount: number) => {
    if (amount === 0) return '0.00';
    return amount.toFixed(4);
  };

  const getLocalValue = (amount: number) => {
    const ethToIDR = 32000000;
    return (amount * ethToIDR).toLocaleString('id-ID', {
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
