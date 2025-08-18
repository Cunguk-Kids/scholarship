import { createFileRoute } from "@tanstack/react-router";
import { DashboardPageV2 } from "@/features/v2/dahsboard/pages";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPageV2,
});