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
      address: "0x42D68F24469b681d86A1d62E54D256b13718567a",
      startBlock: 24118493,
    },
  },
});
