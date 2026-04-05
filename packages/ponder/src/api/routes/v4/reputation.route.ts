import { Hono } from "hono";
import { db } from "@/db";
import { v4Reputation } from "@/db/schema";
import { eq } from "drizzle-orm";

export const reputationRoute = new Hono();

/**
 * GET /:address — Get REP (Soulbound Token) balance for an address
 */
reputationRoute.get("/:address", async (c) => {
  try {
    const address = c.req.param("address").toLowerCase();

    const [rep] = await db.select().from(v4Reputation)
      .where(eq(v4Reputation.address, address))
      .limit(1);

    if (!rep) {
      return c.json({
        data: {
          address,
          repBalance: "0",
          totalMinted: "0",
          totalBurned: "0",
          remainingVotingPower: "0",
          votingLockedUntil: null,
          isVotingLocked: false,
        },
      });
    }

    const isVotingLocked = rep.votingLockedUntil
      ? new Date(rep.votingLockedUntil) > new Date()
      : false;

    return c.json({
      data: {
        ...rep,
        isVotingLocked,
      },
    });
  } catch (err) {
    return c.json({ error: "Failed to fetch reputation", details: String(err) }, 500);
  }
});
