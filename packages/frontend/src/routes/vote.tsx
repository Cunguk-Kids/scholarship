import { createFileRoute } from "@tanstack/react-router";
import { VotePage } from "@/features/v4/vote/pages/VotePage";

export const Route = createFileRoute("/vote")({
  component: VotePage,
});
