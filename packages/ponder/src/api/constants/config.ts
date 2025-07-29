import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { liskSepolia } from 'viem/chains';

const privateKey = process.env.RELAYER_PRIVATE_KEY as `0x${string}`;
export const relayerAccount = privateKeyToAccount(privateKey);

export const publicClient = createPublicClient({
  chain: liskSepolia,
  transport: http(process.env.PONDER_RPC_URL_LISK),
});

export const walletClient = createWalletClient({
  chain: liskSepolia,
  transport: http(process.env.PONDER_RPC_URL_LISK),
  account: relayerAccount,
});

export const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}` || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";