import { createFileRoute } from "@tanstack/react-router";
import { ProgramsPage } from "@/features/v4/programs/pages/ProgramsPage";

export const Route = createFileRoute("/programs/")(  {
  component: ProgramsPage,
});
