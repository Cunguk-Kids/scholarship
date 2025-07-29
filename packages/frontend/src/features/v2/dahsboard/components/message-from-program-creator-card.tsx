import { Button } from "@/components/Button";
import { BaseCard } from "./base-card";

export function MessageFromProgramCreator(props: {
  programCreator: string;
  message: string;
}) {
  return (
    <BaseCard className="gap-2 flex flex-col">
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
    </BaseCard>
  );
}
