import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { hardhat, liskSepolia } from "viem/chains";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-verify";

dotenv.config();

// profiles: {
//   default: {
//     version: "0.8.28",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 200,
//       },
//     },
//   },
//   production: {
//     version: "0.8.28",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 200,
//       },
//     },
//   },
// },
/** @type {import("hardhat/types/config").HardhatConfig} **/
const config = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      viaIR: true,
    },
  },
  // v3/ is an archive folder — exclude it from compilation.
  // Hardhat compiles every .sol under paths.sources; we rename
  // the archive folder with a leading underscore so it is skipped.
  paths: {
    sources: "./contracts",
  },
  networks: {
    liskSepolia: {
      type: "http",
      url: liskSepolia.rpcUrls.default.http[0],
      chainId: liskSepolia.id,
    },
    localhost: {
      type: "http",
      url: hardhat.rpcUrls.default.http[0],
      chainId: hardhat.id,
    },
    ganache: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: {
        mnemonic: process.env.MNEMONIC ?? "THE HECK IS THIS",
      },
    },
  },
  etherscan: {
    apiKey: {
      liskSepolia: "empty",
    },
    customChains: [
      {
        network: "liskSepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
    ],
  },
};

if (process.env.DEPLOYER_PRIVATE_KEY)
  Reflect.set(config.networks.liskSepolia, "accounts", [
    process.env.DEPLOYER_PRIVATE_KEY,
  ]);

export default config;
