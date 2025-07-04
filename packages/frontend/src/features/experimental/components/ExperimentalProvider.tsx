import { ExperimentalInjection } from '../context/experimental-context';

export function ExperimentalProvider({ children }: { children: React.ReactNode }) {
  const state = ExperimentalInjection.init(); // call hook

  return <ExperimentalInjection.provider value={state}>{children}</ExperimentalInjection.provider>;
}
