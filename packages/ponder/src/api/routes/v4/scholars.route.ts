import { Hono } from "hono";
import { db } from "@/db";
import { v4Scholars, v4Programs, v4Milestones } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const scholarsRoute = new Hono();

/**
 * GET / — List scholars
 * Query params:
 *   ?wallet=0x...     → filter by scholar wallet
 *   ?status=ACTIVE    → filter by status
 *   ?limit=20         → pagination limit
 *   ?offset=0         → pagination offset
 */
scholarsRoute.get("/", async (c) => {
  try {
    const wallet = c.req.query("wallet");
    const status = c.req.query("status");
    const limit = Math.min(Number(c.req.query("limit") ?? 20), 100);
    const offset = Number(c.req.query("offset") ?? 0);

    const conditions = [];
    if (wallet) conditions.push(eq(v4Scholars.wallet, wallet));
    if (status) conditions.push(eq(v4Scholars.status, status as NonNullable<typeof v4Scholars.$inferInsert["status"]>));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const scholars = await db.select({
      scholar: v4Scholars,
      program: {
        id: v4Programs.id,
        pid: v4Programs.pid,
        metadataCID: v4Programs.metadataCID,
        status: v4Programs.status,
        initiator: v4Programs.initiator,
        totalFund: v4Programs.totalFund,
      },
    })
      .from(v4Scholars)
      .leftJoin(v4Programs, eq(v4Scholars.programId, v4Programs.id))
      .where(where)
      .orderBy(desc(v4Scholars.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({ data: scholars });
  } catch (err) {
    return c.json({ error: "Failed to fetch scholars", details: String(err) }, 500);
  }
});

/**
 * GET /:wallet — Scholar detail with milestones
 */
scholarsRoute.get("/:wallet", async (c) => {
  try {
    const wallet = c.req.param("wallet");
    const programId = c.req.query("programId");

    const conditions = [eq(v4Scholars.wallet, wallet)];
    if (programId) {
      const numId = Number(programId);
      if (!isNaN(numId)) {
        conditions.push(eq(v4Scholars.pid, numId));
      }
    }

    const where = sql`${sql.join(conditions, sql` AND `)}`;

    const scholars = await db.select({
      scholar: v4Scholars,
      program: {
        id: v4Programs.id,
        pid: v4Programs.pid,
        metadataCID: v4Programs.metadataCID,
        status: v4Programs.status,
      },
    })
      .from(v4Scholars)
      .leftJoin(v4Programs, eq(v4Scholars.programId, v4Programs.id))
      .where(where)
      .orderBy(desc(v4Scholars.createdAt));

    if (scholars.length === 0) {
      return c.json({ error: "Scholar not found" }, 404);
    }

    const results = await Promise.all(
      scholars.map(async (s) => {
        const milestones = await db.select().from(v4Milestones)
          .where(eq(v4Milestones.scholarId, s.scholar.id))
          .orderBy(v4Milestones.blockchainId);
        return { ...s, milestones };
      })
    );

    return c.json({ data: results });
  } catch (err) {
    return c.json({ error: "Failed to fetch scholar", details: String(err) }, 500);
  }
});
