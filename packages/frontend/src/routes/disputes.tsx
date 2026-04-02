import { createFileRoute } from "@tanstack/react-router";
import { DisputesPage } from "@/features/v4/disputes/pages/DisputesPage";

export const Route = createFileRoute("/disputes")({
  component: DisputesPage,
});
