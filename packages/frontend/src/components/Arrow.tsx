interface ArrowProps {
  direction: "left" | "right" | "up" | "down";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const Arrow = ({
  direction = "left",
  onClick = () => {},
  disabled = false,
  className = ""
}: ArrowProps) => {
  return (
    <button
      disabled={disabled}
      type="button"
      className={`flex p-4 items-center gap-2.5 rounded-2xl bg-white max-sm:p-2 max-sm:rounded-lg ${className}`}
      onClick={() => onClick()}
    >
      {direction === "left" && (
        <img src="/icons/arrow-left.svg" className="max-sm:size-4" alt="arrow-left" />
      )}
      {direction === "right" && (
        <img src="/icons/arrow-right.svg" className="max-sm:size-4" alt="arrow-right" />
      )}
      {/* {direction === "up" && (
        <img src="/icons/arrow-up.svg" alt="arrow-up" />
      )}
      {direction === "down" && (
        <img src="/icons/arrow-down.svg" alt="arrow-down" />
      )} */}
    </button>
  );
};
