import { useApproachable } from "@/hooks/use-approchable";

export function ApproachableWrapper(props: {
  children: React.ReactNode;
  className?: string;
}) {
  const [ref] = useApproachable<HTMLDivElement>();
  return (
    <div className={props.className} ref={ref}>
      {props.children}
    </div>
  );
}
