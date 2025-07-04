import ExperimentalHome from '@/features/experimental/pages/ExperimentalHome';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/experimental')({
  component: ExperimentalHome,
});
