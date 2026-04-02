import { createFileRoute } from "@tanstack/react-router";
import { ProgramDetailPage } from "@/features/v4/programs/pages/ProgramDetailPage";

export const Route = createFileRoute("/programs/$id")({
  component: ProgramDetailPage,
});
