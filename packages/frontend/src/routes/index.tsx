import { HomePage } from "@/features/v2/home/pages";
import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  component: HomePage,
  beforeLoad: () => {
    throw redirect({ to: "/scholarships" });
  },
});
