import { createInjection } from "../../util/create-inject";
import { useRef, useState } from "react";
import { useDebounce } from "../use-debounce";

type LState =
  | {
      type: "confirmation" | "proccessing" | "none" | "error" | "success";
      description?: string;
    }
  | {
      type: "alert-confirmation";
      title: string;
      description?: string;
      acceptLabel?: string;
      rejectLabel?: string;
      onAccept: () => unknown;
      onReject: () => unknown;
    };

function useLoading() {
  const [loading, setLoading] = useState<LState>({ type: "none" });
  const isFirstTime = useRef(false);

  return {
    loading,
    setLoading,
    isFirstTime,
  };
}

export const appStateInjection = createInjection(() => {
  const injected = {
    loading: useLoading(),
  };

  return injected;
});
