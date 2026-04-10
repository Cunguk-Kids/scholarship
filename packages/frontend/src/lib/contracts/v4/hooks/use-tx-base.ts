import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

/**
 * Shared helper for contract write transactions with loading and success states.
 *
 * confirmations: 1  — don't wait for extra confirmations (local dev chains)
 * pollingInterval   — poll every 1s so the receipt is caught quickly on local nodes
 */
export function useTxHook() {
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    pollingInterval: 1_000,
  });

  return { 
    hash, 
    writeContract, 
    isPending: isPending || isWaiting, 
    isSuccess, 
    error, 
    reset 
  };
}
