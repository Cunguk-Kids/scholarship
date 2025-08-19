import { createConfig } from "ponder";
import dotenv from "dotenv";
import { scholarshipAbi } from "./abis/abi";
import { setupHandlers } from "./src";
import { ethers } from "ethers";

dotenv.config();
setupHandlers();

const provider = new ethers.JsonRpcProvider(process.env.PONDER_RPC_URL_LISK!);
const blockNumber = await provider.getBlockNumber();

export default createConfig({
  chains: {
    //  mainnet: {
    //   id: 31337,
    //   rpc: process.env.PONDER_RPC_URL_1,
    // },
    lisk: {
      id: 4202,
      rpc: process.env.PONDER_RPC_URL_LISK!,
    },
  },
  contracts: {
    scholarship: {
      chain: "lisk",
      abi: scholarshipAbi,
      address: "0xA5aC7aA1d96B7Aa58a565F8eAAC89575ddD19eb7",
      startBlock: 25146027,
      // startBlock: 24118493,
    },
  },
});
