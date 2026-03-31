import { useState, useEffect } from "react";

export function useDebounce<T>(
  value: T,
  opts: {
    delay: number;
  } = { delay: 1000 }
) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceValue(value), opts.delay);

    return () => clearTimeout(timeout);
  }, [opts.delay, value]);

  return debounceValue;
}
