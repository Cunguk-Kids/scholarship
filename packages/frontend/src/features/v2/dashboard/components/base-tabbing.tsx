import { createInjection } from "@/util/create-inject";
import { useState } from "react";

const tabbingInjection = createInjection(
  (props: Parameters<typeof BaseTabbing>[0]) => {
    const [primitiveCurrent, setPrimitiveCurrent] = useState(
      props.defaultValue ?? ""
    );

    const current = props.value === undefined ? primitiveCurrent : props.value;
    const setCurrent = (value: string) => {
      setPrimitiveCurrent(value);
      props.onValueChange?.(value);
    };

    return {
      current,
      setCurrent,
    };
  }
);

export function BaseTabbing(props: {
  children: React.ReactNode;
  className?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => unknown;
}) {
  const provider = tabbingInjection.init(props);
  return (
    <tabbingInjection.provider value={provider}>
      <div className={`flex flex-col ${props.className}`}>{props.children}</div>
    </tabbingInjection.provider>
  );
}

export function BaseTabbingTrigger(props: React.ComponentProps<"button">) {
  const { setCurrent, current } = tabbingInjection.use();
  return (
    <button
      {...props}
      className={`${current == props.value ? "!bg-skbw !border-b-0 h-15" : ""} rounded-t-2xl p-2 font-paytone border-4 focus:outline-skpurple ${props.className}`}
      onClick={() => setCurrent(props.value as string)}
    >
      {props.children}
    </button>
  );
}

export function BaseTabbingList(props: React.ComponentProps<"div">) {
  return (
    <div {...props} className="-mb-1 -space-x-1 z-1 flex items-end">
      {props.children}
    </div>
  );
}

export function BaseTabbingContent(
  props: React.ComponentProps<"div"> & { value: string }
) {
  const { current } = tabbingInjection.use();
  return current == props.value ? (
    <div
      {...props}
      className={`flex bg-skbw border-4 rounded-b-2xl rounded-r-2xl relative before:absolute before:inset-0 before:translate-4 before:bg-black before:rounded-2xl after:bg-skbw after:inset-0 after:rounded-2xl after:absolute isolate after:-z-1 before:-z-2 grow p-4 max-sm:rounded-t-none ${props.className ?? ""}`}
    >
      {props.children}
    </div>
  ) : null;
}
