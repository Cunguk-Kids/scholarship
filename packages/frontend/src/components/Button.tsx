import { ConnectButton } from "@rainbow-me/rainbowkit";

interface ButtonProps {
  label?: string;
  type?: "" | "connect";
  size?: "small" | "large";
  onClick?: () => void;
}

const getButtonClasses = (
  size: string = "small",
  bgColor: string = "bg-skpurple",
  hover?: string
) => {
  const sizeClass =
    size === "small" ? "py-2 px-4 text-base" : "px-6 py-3 text-2xl";
  return `flex relative -left-1 -top-1 font-nunito ${sizeClass} items-center gap-2.5 rounded-lg border-solid border-black ${bgColor} text-white ${
    hover ? `hover:${hover}` : "hover:bg-skpurple-hover"
  } active:inset-shadow-pressed transition-transform active:translate-x-1 active:translate-y-1 border-2 border-black`;
};

const ButtonWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 self-stretch rounded-lg bg-black">
    {children}
  </div>
);

export const Button = ({
  label = "buttonLabel",
  type = "",
  size = "small",
  onClick = () => {},
}: ButtonProps) => {
  if (type !== "connect") {
    return (
      <div className="flex flex-col items-start">
        <ButtonWrapper>
          <button
            onClick={onClick}
            type="button"
            className={getButtonClasses(size)}
          >
            {label}
          </button>
        </ButtonWrapper>
      </div>
    );
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!ready) {
          return (
            <div
              aria-hidden="true"
              style={{
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          );
        }

        return (
          <div className="flex flex-col items-start gap-2">
            {!connected ? (
              <ButtonWrapper>
                <button
                  onClick={openConnectModal}
                  type="button"
                  className={getButtonClasses(size)}
                >
                  {label}
                </button>
              </ButtonWrapper>
            ) : chain.unsupported ? (
              <ButtonWrapper>
                <button
                  onClick={openChainModal}
                  type="button"
                  className={getButtonClasses(size, "bg-skred", "bg-skpink")}
                >
                  Wrong network
                </button>
              </ButtonWrapper>
            ) : (
              <div className="flex gap-2">
                <ButtonWrapper>
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={getButtonClasses(size)}
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: "hidden",
                          marginRight: 4,
                        }}
                      >
                        <img
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl}
                          style={{ width: 12, height: 12 }}
                        />
                      </div>
                    )}
                    {chain.name}
                  </button>
                </ButtonWrapper>

                <ButtonWrapper>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className={getButtonClasses(size)}
                  >
                    {account.displayName}
                    {account.displayBalance && ` (${account.displayBalance})`}
                  </button>
                </ButtonWrapper>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
