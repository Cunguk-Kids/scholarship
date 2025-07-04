import { ExperimentalPage } from '@/features/experimental/pages/ExperimentalPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/experimental')({
  component: ExperimentalPage,
});
