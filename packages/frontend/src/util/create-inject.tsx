import { createContext, useContext } from "react";

export function createInjection<T>(hook: () => T) {
  const ctx = createContext<T>(undefined as never);
  return {
    init: hook,
    provider: (props: { value: T; children: React.ReactNode }) => (
      <ctx.Provider value={props.value}>{props.children}</ctx.Provider>
    ),
    use: (): T => {
      const c = useContext(ctx);
      if (!c) throw new Error("No Injection Provider Found");
      return c;
    },
  };
}