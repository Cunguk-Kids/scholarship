import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid place-content-center grow text-5xl font-bold text-blue-500 text-shadow-md">
      Hello :)
    </div>
  );
}
