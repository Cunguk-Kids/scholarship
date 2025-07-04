import { hardhat } from "viem/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

const ganacheLocal = defineChain({
  id: 1337,
  name: 'Ganache Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'], // Ganache's default RPC URL
    },
    public: { // Often the same as default for local networks
      http: ['http://127.0.0.1:8545'],
    },
  },
});

export const wagmiConfig = getDefaultConfig({
  appName: "Skoolchain",
  projectId: "YOUR_PROJECT_ID",
  chains: [ganacheLocal, hardhat],
  ssr: false,
});
