import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/v4/dashboard/pages/DashboardPage";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});
