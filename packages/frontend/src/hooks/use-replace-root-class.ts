import { useEffect } from "react";

/**
 * Implementation
 * ```css
 * --color-skpurple: #6a88f8;
 * --color-skpurple-hover: #4565dd;
 * --color-skred: #f55f4b;
 * --color-skyellow: #fcd343;
 * --color-skpink: #ff7989;
 * --color-skbw: #fcf0e3;
 * --color-skbw-hover: #f5d9b3;
 * --color-skgreen: #d9fbb0;
 * --color-error-container: #F9DEDC;
 * --color-on-error-container:#852221;
 * ```
 */
export function useReplaceRootClass(props: {
  oldClassList: string[];
  newClassList: string[];
}) {
  useEffect(() => {
    const root = document.getElementById("skoolcein-root")!;
    root.classList.remove(...props.oldClassList);
    root.classList.add(...props.newClassList);
    return () => {
      root.classList.remove(...props.newClassList);
      root.classList.add(...props.oldClassList);
    };
  }, []);
}