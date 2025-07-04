import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { appStateInjection } from "../hooks/inject/app-state";
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const provider = appStateInjection.init();
  return (
    <appStateInjection.provider value={provider}>
      <main className="bg-skbw min-h-screen flex flex-col font-nunito w-full overflow-x-hidden">
        <Header />
        <Outlet />
      </main>
    </appStateInjection.provider>
  );
}
