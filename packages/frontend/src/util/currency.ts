export function usdToIdr(usd: number) {
  return usd * 16440.45;
}
export function formatCurrency(value: number, currency: "IDR" | "USD") {
  return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(value);
}

export function formatUSDC(value: bigint | number) {
  return Number(value) / 10 ** 6;
}
