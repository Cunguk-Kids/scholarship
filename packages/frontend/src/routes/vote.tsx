import { VotePage } from "@/features/vote/pages/VotePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/vote")({
  component: VotePage,
});
