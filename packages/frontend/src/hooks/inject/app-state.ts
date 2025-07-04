import { useBlockNumber } from "wagmi";
import { createInjection } from "../../util/create-inject";

export const appStateInjection = createInjection(() => {
  const blockNumber =
    useBlockNumber({ cacheTime: 5 * 1_000, watch: true }) ?? 0n;

  const injected = {
    blockNumber,
  };

  return injected;
});
