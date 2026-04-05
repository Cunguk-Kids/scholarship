import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "@/features/v4/admin/pages/AdminDashboardPage";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
});
