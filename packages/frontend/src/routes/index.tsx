import { HomePage } from "@/features/v2/home/pages";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  component: HomePage,
});
