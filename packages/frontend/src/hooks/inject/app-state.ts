import { createInjection } from "../../util/create-inject";
import { useState } from "react";

type LState = {
  type: "confirmation" | "proccessing" | "none" | "error" | "success";
  message?: string;
};

function useLoading() {
  const [loading, setLoading] = useState<LState>({ type: "none" });
  return {
    loading,
    setLoading,
  };
}

export const appStateInjection = createInjection(() => {
  const injected = {
    loading: useLoading(),
  };

  return injected;
});
