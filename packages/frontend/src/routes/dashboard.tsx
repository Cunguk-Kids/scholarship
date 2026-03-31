import { createFileRoute } from "@tanstack/react-router";
import { DashboardPageV2 } from "@/features/v2/dashboard/pages";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPageV2,
});