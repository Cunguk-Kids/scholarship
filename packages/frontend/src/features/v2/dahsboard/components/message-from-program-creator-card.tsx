import { Button } from "@/components/Button";
import { BaseCard } from "./base-card";
import { Loader } from "@/components/fallback/loader";

export function MessageFromProgramCreator(props: {
  programCreator: string;
  message: string;
  isLoading: boolean;
}) {
  return (
    <BaseCard className="relative isolate">
      {props.isLoading && (
        <Loader className="absolute inset-0 m-auto size-10" />
      )}
      <div
        className="gap-2 flex flex-col transition-opacity"
        style={{
          opacity: props.isLoading ? 0 : 1,
        }}
      >
        <div className="flex gap-1 items-center">
          <img src="/icons/message-notification-01.svg" alt="msg-notif-icon" />
          from{" "}
          <span className="font-bold">
            {props.programCreator.slice(0, 7)}...
            {props.programCreator.slice(-4)}
          </span>
        </div>
        <div className="h-px w-full bg-black/8"></div>
        <div className="italic [text-wrap:pretty]">"{props.message}"</div>
        <div className="self-end">
          <Button label="Reply" />
        </div>
      </div>
    </BaseCard>
  );
}
