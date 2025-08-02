import { formatGwei } from "viem";

export const getLocalValue = (amount: bigint | number | string, rate: number) => {
  let token: number;

  try {
    token =
      typeof amount === 'bigint'
        ? Number(formatGwei(amount))
        : typeof amount === 'string'
          ? parseFloat(amount)
          : amount;
  } catch {
    token = 0;
  }

  const converted = (token / 1000000) * rate;
  const safeValue = isNaN(converted) || !isFinite(converted) ? 0 : converted;

  return safeValue.toLocaleString('id-ID', {
    // style: 'currency',
    currency: 'IDR',
    style: 'decimal',
    maximumFractionDigits: 0,
  });
};