import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="p-2 flex bg-white m-9 rounded-lg px-6 py-[22px] items-center">
      <img src="/logo.png" alt="logo" />
      <div className="flex gap-6 text-gray-700 mx-auto">
        <div>Home</div>
        <div className="text-skpurple font-bold">Scholarships</div>
        <div>Vote</div>
        <div>MyWallet</div>
      </div>
      <ConnectButton />
    </header>
  );
}
