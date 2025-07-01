import { hardhat } from "viem/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const wagmiConfig = getDefaultConfig({
  appName: "Skoolchain",
  projectId: "YOUR_PROJECT_ID",
  chains: [hardhat],
  ssr: false,
});
