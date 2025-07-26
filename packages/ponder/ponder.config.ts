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
      address: "0xe2bfBd40F6A00F10c08c817a44fc3e3ffb418100",
      startBlock: blockNumber,
    },
  },
});
