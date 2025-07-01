import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="p-2 flex justify-end">
      <ConnectButton />
    </header>
  );
}
