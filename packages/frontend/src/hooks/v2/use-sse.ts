/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';

interface UseSSEOptions<T> {
  url: string;
  event: string;
  initialData?: T;
}

export function useSSE<T = any>({ url, event, initialData }: UseSSEOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener(event, (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        setData(parsed);
      } catch (err) {
        console.error(`Error parsing event data "${event}"`, err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, [url, event]);

  return { data };
}
