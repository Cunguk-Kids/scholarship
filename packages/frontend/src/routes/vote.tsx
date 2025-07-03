import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/vote")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grow flex flex-col">
      <div className="flex flex-col items-center w-200 gap-6 mx-auto">
        <h2 className="font-paytone text-5xl text-center">
          Want to help choose who deserves the chance?
        </h2>
        <p className="text-2xl">Join the vote—change a life.</p>
      </div>
    </div>
  );
}
