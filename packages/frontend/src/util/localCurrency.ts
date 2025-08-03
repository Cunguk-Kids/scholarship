import { formatGwei } from "viem";

export const getLocalValue = (
  amount: bigint | number | string,
  rate: number
) => {
  let token: number;

  try {
    token =
      typeof amount === "bigint"
        ? Number(formatGwei(amount))
        : typeof amount === "string"
          ? parseFloat(amount)
          : amount;
  } catch {
    token = 0;
  }

  const converted = (token / 1000000) * rate;
  const safeValue = isNaN(converted) || !isFinite(converted) ? 0 : converted;

  return safeValue.toLocaleString("en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
};

export const idrToUsdc = (idr: number, rate = 16000): number => {
  return +(idr / rate).toFixed(6);
};

export const parseIDR = (val: string): number => {
  return Number(val.replace(/\D/g, ''));
};

export const usdcToIdr = (usdc: number, rate = 16000) => {
  return usdc * rate;
};

export const formatToIDR = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
};

export const formatToUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};
