import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/header";
import { appStateInjection } from "../hooks/inject/app-state";
import { useBlockNumber } from "wagmi";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const blockNumber = useBlockNumber({ cacheTime: 5 * 1_000, watch: true });
  const provider = appStateInjection.init(blockNumber.data ?? 0n);
  return (
    <appStateInjection.provider value={provider}>
      <main className="bg-skbw min-h-screen flex flex-col font-nunito w-full overflow-x-hidden">
        <Header />
        <Outlet />
      </main>
    </appStateInjection.provider>
  );
}
