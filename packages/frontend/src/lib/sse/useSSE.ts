import { useEffect, useRef, useState } from "react";

interface UseSSEOptions {
  url: string;
  event: string;
}

/**
 * Hook to consume Server-Sent Events from the Ponder SSE endpoint.
 * Reconnects automatically on disconnect.
 */
export function useSSE<T = unknown>({ url, event }: UseSSEOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setIsConnected(true);

    es.addEventListener(event, (e) => {
      try {
        const parsed = JSON.parse(e.data) as T;
        setData(parsed);
      } catch {
        console.warn("[SSE] Failed to parse:", e.data);
      }
    });

    es.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [url, event]);

  return { data, isConnected };
}
