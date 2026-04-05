import { db } from "@/db";
import { eq } from "drizzle-orm";
import { v4Programs, v4Reputation, v4BountyHunters } from "@/db/schema";

/** Upsert v4_reputation balance for an address */
export async function upsertReputation(
  address: string,
  delta: bigint,
  isMint: boolean,
) {
  const existing = await db.select().from(v4Reputation)
    .where(eq(v4Reputation.address, address))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(v4Reputation).values({
      address,
      repBalance: String(isMint ? delta : 0n),
      totalMinted: String(isMint ? delta : 0n),
      totalBurned: String(isMint ? 0n : delta),
    });
  } else {
    const row = existing[0]!;
    const prev = BigInt(row.repBalance ?? "0");
    await db.update(v4Reputation)
      .set({
        repBalance: String(isMint ? prev + delta : (prev > delta ? prev - delta : 0n)),
        totalMinted: String(BigInt(row.totalMinted ?? "0") + (isMint ? delta : 0n)),
        totalBurned: String(BigInt(row.totalBurned ?? "0") + (isMint ? 0n : delta)),
        updatedAt: new Date(),
      })
      .where(eq(v4Reputation.address, address));
  }
}

/** Find or insert a v4Program row, returning its UUID */
export async function findProgramUuid(blockchainId: number): Promise<string | null> {
  const rows = await db.select().from(v4Programs)
    .where(eq(v4Programs.blockchainId, blockchainId)).limit(1);
  return rows[0]?.id ?? null;
}

/** Upsert bounty hunter profile */
export async function upsertBountyHunter(address: string) {
  const [existing] = await db.select().from(v4BountyHunters)
    .where(eq(v4BountyHunters.address, address)).limit(1);

  if (!existing) {
    await db.insert(v4BountyHunters).values({ address, totalDisputes: 1 });
  } else {
    await db.update(v4BountyHunters)
      .set({ totalDisputes: (existing.totalDisputes ?? 0) + 1, updatedAt: new Date() })
      .where(eq(v4BountyHunters.address, address));
  }
}

/** Convert bigint timestamp to Date */
export const toDate = (ts: bigint) => ts > 0n ? new Date(Number(ts) * 1000) : null;
