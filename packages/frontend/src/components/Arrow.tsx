interface ArrowProps {
  direction: "left" | "right" | "up" | "down";
  onClick?: () => void;
  disabled?: boolean;
}

export const Arrow = ({
  direction = "left",
  onClick = () => {},
  disabled = false,
}: ArrowProps) => {
  return (
    <button
      disabled={disabled}
      type="button"
      className="flex p-4 items-center gap-2.5 rounded-2xl bg-white"
      onClick={() => onClick()}
    >
      {direction === "left" && (
        <img src="/icons/arrow-left.svg" alt="arrow-left" />
      )}
      {direction === "right" && (
        <img src="/icons/arrow-right.svg" alt="arrow-right" />
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
