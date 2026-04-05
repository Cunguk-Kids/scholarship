import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

/**
 * Shared helper for contract write transactions with loading and success states.
 */
export function useTxHook() {
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  return { 
    hash, 
    writeContract, 
    isPending: isPending || isWaiting, 
    isSuccess, 
    error, 
    reset 
  };
}
