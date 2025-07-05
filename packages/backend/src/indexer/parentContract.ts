const factoryAddress = process.env.FACTORY_ADDRESS;

import {
  createPublicClient,
  http,
} from "viem";

import { hardhat } from "viem/chains";
import { programCreatedEvent, voteCastedEvent } from "./events/events";
// import { addProgram } from "@back/services/program.service";

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http("http://localhost:8545"),
});

const deployedContracts = new Set<string>();
const eventCache: {
  contract: string;
  voter: string;
  proposalId: number;
  blockNumber: bigint;
}[] = [];


export async function startIndexer() {
  const currentBlock = await publicClient.getBlockNumber();
  console.log("currentBlock", currentBlock.toString());

  const logs = await publicClient.getLogs({
    address: factoryAddress as `0x${string}`,
    event: programCreatedEvent,
    fromBlock: 0n,
    toBlock: "latest",
  });

  console.log(`log: ${logs.length}`);

  for (const log of logs) {
    const { programContract } = log.args as {
      id: bigint;
      programContract: `0x${string}`;
      initiator: `0x${string}`;
    };

    if (!deployedContracts.has(programContract)) {
      deployedContracts.add(programContract);
      listenToChildContract(programContract);
    }
  }

  publicClient.watchEvent({
    address: factoryAddress as `0x${string}`,
    event: programCreatedEvent,
    onLogs: (logs) => {
      for (const log of logs) {
        const item = log.args as any;

        if (!deployedContracts.has(item.contractAddress)) {
          deployedContracts.add(item.contractAddress);
          console.log("contractAddress:", item.contractAddress);
          listenToChildContract(item.contractAddress);
          // addProgram({ contractAddress: item.contractAddress, description: item.description, id: item.id, initiatorAddress: item.initiatorAddress, title: item.title, createdAt: item.createdAt, endDate: item.endDate, metadataCid: item.metadataCid, startDate: item.startDate, status: item.status, targetApplicant: item.targetApplicant, updatedAt: item.updatedAt });
        }
      }
    },
  });

  console.log("📡 Indexer running...");
}

function listenToChildContract(address: `0x${string}`) {
  console.log("child contract", address);

  publicClient.watchEvent({
    address,
    event: voteCastedEvent,
    onLogs: (logs) => {
      for (const log of logs) {
        const { voter, proposalId } = log.args as {
          voter: string;
          proposalId: bigint;
        };

        const data = {
          contract: address,
          voter,
          proposalId: Number(proposalId),
          blockNumber: log.blockNumber!,
        };

        console.log("📩 VoteCasted:", data);
        eventCache.unshift(data);
        if (eventCache.length > 200) eventCache.pop();
      }
    },
  });
}
