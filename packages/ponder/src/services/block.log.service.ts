import { db } from "@/db";
import { indexedBlocks } from "@/db/schema";
import { eq } from "drizzle-orm";

type InsertBlockArgs = {
  eventName: string;
  event: {
    block: {
      number: bigint | number;
      timestamp: bigint | number;
    };
  };
};

export const insertBlock = async ({ eventName, event }: InsertBlockArgs) => {
  const blockNumber = Number(event.block.number);
  const timestamp = new Date(Number(event.block.timestamp) * 1000);

  await db.insert(indexedBlocks).values({
    eventName,
    blockNumber,
    timestamp,
  }).onConflictDoUpdate({
    target: [indexedBlocks.blockNumber],
    set: {
      blockNumber,
      timestamp,
    },
  });
};
