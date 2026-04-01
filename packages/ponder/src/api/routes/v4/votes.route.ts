import { Hono } from "hono";
import { db } from "@/db";
import { v4Votes, v4ConfidenceStakes } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const votesRoute = new Hono();

/**
 * GET / — List votes
 * Query params:
 *   ?voter=0x...       → filter by voter address
 *   ?candidate=0x...   → filter by candidate address
 *   ?limit=50          → pagination limit
 *   ?offset=0          → pagination offset
 */
votesRoute.get("/", async (c) => {
  try {
    const voter = c.req.query("voter");
    const candidate = c.req.query("candidate");
    const limit = Math.min(Number(c.req.query("limit") ?? 50), 100);
    const offset = Number(c.req.query("offset") ?? 0);

    const conditions = [];
    if (voter) conditions.push(eq(v4Votes.voterAddress, voter));
    if (candidate) conditions.push(eq(v4Votes.candidateAddress, candidate));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const votes = await db.select().from(v4Votes)
      .where(where)
      .orderBy(desc(v4Votes.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({ data: votes });
  } catch (err) {
    return c.json({ error: "Failed to fetch votes", details: String(err) }, 500);
  }
});

/**
 * GET /stakes — List confidence stakes
 * Query params:
 *   ?voter=0x...       → filter by voter address
 *   ?resolved=true     → filter by resolved status
 */
votesRoute.get("/stakes", async (c) => {
  try {
    const voter = c.req.query("voter");
    const resolved = c.req.query("resolved");
    const limit = Math.min(Number(c.req.query("limit") ?? 50), 100);
    const offset = Number(c.req.query("offset") ?? 0);

    const conditions = [];
    if (voter) conditions.push(eq(v4ConfidenceStakes.voterAddress, voter));
    if (resolved !== undefined) conditions.push(eq(v4ConfidenceStakes.isResolved, resolved === "true"));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const stakes = await db.select().from(v4ConfidenceStakes)
      .where(where)
      .orderBy(desc(v4ConfidenceStakes.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({ data: stakes });
  } catch (err) {
    return c.json({ error: "Failed to fetch confidence stakes", details: String(err) }, 500);
  }
});
