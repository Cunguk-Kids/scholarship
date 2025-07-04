import { ExperimentalProvider } from '../components/ExperimentalProvider';
import { ExperimentalPage } from './ExperimentalPage';

export default function ExperimentalHome() {
  return (
    <ExperimentalProvider>
      <ExperimentalPage />
    </ExperimentalProvider>
  );
}
