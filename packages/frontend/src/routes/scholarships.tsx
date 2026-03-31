import { createFileRoute } from "@tanstack/react-router";
import { ScholarshipsPage } from "@/features/v2/scholarship/pages/index";

export const Route = createFileRoute("/scholarships")({
  component: ScholarshipsPage,
});
