import { createFileRoute } from "@tanstack/react-router";
import { ApplyPage } from "@/features/v4/programs/pages/ApplyPage";

export const Route = createFileRoute("/programs/$id/apply")({
  component: ApplyPage,
});
