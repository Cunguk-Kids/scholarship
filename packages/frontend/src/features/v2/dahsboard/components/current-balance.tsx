import { usdcAddress } from "@/constants/contractAddress";
import { useMemo } from "react";
import { erc20Abi } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { formatCurrency } from "@/util/currency";
import { useTokenRate } from "@/context/token-rate-context";

export function CurrentBalance(props: { className?: string }) {
  const account = useAccount();
  const balance = useReadContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address!],
    query: {
      enabled: Boolean(account.address),
    },
  });

  const converted = useMemo(
    () => Number(balance.data ?? 0) / 6 ** 10,
    [balance.data]
  );

  const rate = useTokenRate();
  console.log(rate.rate);
  return (
    <div
      className={`${"bg-black rounded-2xl py-2 px-8 text-white flex flex-col items-end"} ${props.className ?? ""}`}
    >
      <div>Current Balance</div>
      <div className="w-max">{formatCurrency(converted, "USD")} USDC</div>
    </div>
  );
}
