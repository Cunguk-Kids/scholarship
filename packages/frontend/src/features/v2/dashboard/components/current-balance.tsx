import { usdcAddress } from "@/constants/contractAddress";
import { useMemo } from "react";
import { erc20Abi } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { formatCurrency, formatUSDC } from "@/util/currency";
import { Loader } from "@/components/fallback/loader";

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
    () => formatUSDC(balance.data ?? 0n),
    [balance.data]
  );

  return (
    <div
      className={`${"bg-black rounded-2xl py-2 px-8 text-white flex flex-col items-end relative isolate"} ${props.className ?? ""}`}
    >
      {balance.isLoading && <Loader className="absolute inset-0 m-auto" />}
      <div className={balance.isLoading ? "text-black" : ""}>
        Current Balance
      </div>
      <div className={`w-max ${balance.isLoading ? "text-black" : ""}`}>
        {formatCurrency(converted, "USD")} USDC
      </div>
    </div>
  );
}
