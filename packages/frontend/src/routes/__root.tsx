import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/header";
import { appStateInjection } from "../hooks/inject/app-state";
import { ReactFlowProvider } from "@xyflow/react";
import { LoadingState } from "@/components/ui/loading-state";
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const provider = appStateInjection.init();
  return (
    <appStateInjection.provider value={provider}>
      <main className="bg-skbw min-h-screen flex flex-col font-nunito w-full overflow-x-hidden isolate">
        <Header />
        <ReactFlowProvider>
          <Outlet />
        </ReactFlowProvider>
      </main>
      <LoadingState />
    </appStateInjection.provider>
  );
}
