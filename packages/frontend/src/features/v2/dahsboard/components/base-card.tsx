import type React from "react";

export function BaseCard(props: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`p-4 before:bg-white before:inset-0 before:absolute before:rounded-2xl before:-z-1 after:absolute after:bg-black after:inset-0 after:-z-2 after:rounded-2xl after:translate-4 bg-white rounded-2xl border-black font-nunito relative isolate border-4 ${props.className}`}
    >
      {props.children}
    </div>
  );
}
