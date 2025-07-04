import { HomePage } from "@/features/scholarship/pages/HomePage";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  component: HomePage,
});
