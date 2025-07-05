import { useBlockNumber } from "wagmi";
import { createInjection } from "../../util/create-inject";
import { useState } from "react";

type LState = {
  type: "confirmation" | "proccessing" | "none" | "error" | "success";
  message?: string;
};

function useLoading() {
  const [loading, setLoading] = useState<LState>({ type: "none" });
  return {
    loading,
    setLoading,
  };
}

export const appStateInjection = createInjection(() => {
  const blockNumber =
    useBlockNumber({ cacheTime: 5 * 1_000, watch: true }) ?? 0n;

  const injected = {
    blockNumber,
    loading: useLoading(),
  };

  return injected;
});
