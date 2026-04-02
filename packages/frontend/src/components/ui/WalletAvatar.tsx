/** Generate a deterministic gradient avatar from a wallet address */
export function WalletAvatar({
  address,
  size = 40,
  className = "",
}: {
  address: string;
  size?: number;
  className?: string;
}) {
  // simple hash → hue
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 120) % 360;

  return (
    <div
      className={`rounded-full border-2 border-black neo-shadow-sm shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 60%))`,
      }}
      title={address}
    />
  );
}

/** Truncate an address to 0x1234…abcd format */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}
