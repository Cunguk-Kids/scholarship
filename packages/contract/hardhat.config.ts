import { task, type HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { hardhat, monadTestnet } from "viem/chains";
import * as dotenv from "dotenv";
import "@nomiclabs/hardhat-etherscan";

dotenv.config();

console.log(process.env.MNEMONIC, process.env.DEPLOYER_PRIVATE_KEY);

const config = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    monadTestnet: {
      type: "http",
      url: monadTestnet.rpcUrls.default.http[0],
      chainId: monadTestnet.id,
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
        mnemonic: process.env.MNEMONIC! ?? "THE HECK IS THIS",
      },
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org",
    browserUrl: "https://testnet.monadexplorer.com",
  } as never,
  etherscan: {
    enabled: false,
  },
} satisfies HardhatUserConfig;

if (process.env.DEPLOYER_PRIVATE_KEY)
  Reflect.set(config.networks.monadTestnet, "accounts", [
    process.env.DEPLOYER_PRIVATE_KEY,
  ]);

const config2: HardhatUserConfig = {
  solidity: "0.8.28", // replace if necessary
  networks: {
    monad: {
      url: "https://testnet-rpc.monad.xyz/",
      type: "http",
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org",
    browserUrl: "https://testnet.monadexplorer.com",
  },
  etherscan: {
    enabled: false,
  },
};
export default config2;
