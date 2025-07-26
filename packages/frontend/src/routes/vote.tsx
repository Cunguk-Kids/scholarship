// import { VotePage } from "@/features/vote/pages/VotePage";
import { VotePage } from "@/features/v2/vote/pages/index";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/vote")({
  component: VotePage,
});
