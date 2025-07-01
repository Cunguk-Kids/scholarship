import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/header";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <main className="bg-yellow-50 min-h-screen flex flex-col">
      <Header />
      <Outlet />
    </main>
  );
}
