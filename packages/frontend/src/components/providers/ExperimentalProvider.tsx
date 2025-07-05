import { RootInjection } from '@/context/app-context';

export function RootProvider({ children }: { children: React.ReactNode }) {
  const state = RootInjection.init(); // call hook

  return <RootInjection.provider value={state}>{children}</RootInjection.provider>;
}
