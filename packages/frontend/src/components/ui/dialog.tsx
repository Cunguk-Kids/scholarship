import { useClickOutside } from "@/hooks/useClickOutside";
import type React from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";

export function Dialog(props: {
  open?: boolean;
  onOpenChange?: (value: boolean) => unknown;
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => {
    props.onOpenChange?.(false);
  });

  return props.open
    ? createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-xs">
          <div className= {`bg-skbw rounded-2xl p-12 shadow-md ${props.className ?? ""}`} ref={ref}>
            {props.children}
          </div>
        </div>,
        document.body
      )
    : null;
}
