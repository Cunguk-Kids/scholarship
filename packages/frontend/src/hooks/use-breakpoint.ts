import { useEffect, useState } from "react";

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;
const breakpointOrder = Object.keys(breakpoints) as Breakpoint[];

const getCurrentBreakpoint = (width: number): Breakpoint => {
  let current: Breakpoint = "xs";
  for (const key of breakpointOrder) {
    if (width >= breakpoints[key]) {
      current = key;
    }
  }
  return current;
};

export function useBreakpoint() {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  const current = getCurrentBreakpoint(width);

  const compare = {
    is: (bp: Breakpoint) => current === bp,
    isGreaterThan: (bp: Breakpoint) => breakpoints[current] > breakpoints[bp],
    isLessThan: (bp: Breakpoint) => breakpoints[current] < breakpoints[bp],
    isAtLeast: (bp: Breakpoint) => breakpoints[current] >= breakpoints[bp],
    isAtMost: (bp: Breakpoint) => breakpoints[current] <= breakpoints[bp],
  };

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    current,
    width,
    ...compare,
  };
}
