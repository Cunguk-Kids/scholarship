import { Hono } from "hono";
import { db } from "@/db";
import { v4Disputes, v4Programs } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const disputesRoute = new Hono();

/**
 * GET / — List disputes
 * Query params:
 *   ?status=ACTIVE        → filter by status
 *   ?bountyHunter=0x...   → filter by BH address
 *   ?scholar=0x...        → filter by scholar address
 *   ?limit=20             → pagination limit
 *   ?offset=0             → pagination offset
 */
disputesRoute.get("/", async (c) => {
  try {
    const status = c.req.query("status");
    const bountyHunter = c.req.query("bountyHunter");
    const scholar = c.req.query("scholar");
    const limit = Math.min(Number(c.req.query("limit") ?? 20), 100);
    const offset = Number(c.req.query("offset") ?? 0);

    const conditions = [];
    if (status) conditions.push(eq(v4Disputes.status, status as NonNullable<typeof v4Disputes.$inferInsert["status"]>));
    if (bountyHunter) conditions.push(eq(v4Disputes.bountyHunter, bountyHunter));
    if (scholar) conditions.push(eq(v4Disputes.scholarAddress, scholar));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const disputes = await db.select({
      dispute: v4Disputes,
      program: {
        id: v4Programs.id,
        blockchainId: v4Programs.blockchainId,
        metadataCID: v4Programs.metadataCID,
        status: v4Programs.status,
      },
    })
      .from(v4Disputes)
      .leftJoin(v4Programs, eq(v4Disputes.programId, v4Programs.id))
      .where(where)
      .orderBy(desc(v4Disputes.createdAt))
      .limit(limit)
      .offset(offset);

    const [total] = await db.select({ count: sql<number>`count(*)` })
      .from(v4Disputes).where(where);

    return c.json({ data: disputes, total: Number(total?.count ?? 0), limit, offset });
  } catch (err) {
    return c.json({ error: "Failed to fetch disputes", details: String(err) }, 500);
  }
});

/**
 * GET /:id — Single dispute by UUID or blockchainId
 */
disputesRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    let results = await db.select({
      dispute: v4Disputes,
      program: {
        id: v4Programs.id,
        blockchainId: v4Programs.blockchainId,
        metadataCID: v4Programs.metadataCID,
        status: v4Programs.status,
      },
    })
      .from(v4Disputes)
      .leftJoin(v4Programs, eq(v4Disputes.programId, v4Programs.id))
      .where(eq(v4Disputes.id, id))
      .limit(1);

    if (results.length === 0) {
      const numId = Number(id);
      if (!isNaN(numId)) {
        results = await db.select({
          dispute: v4Disputes,
          program: {
            id: v4Programs.id,
            blockchainId: v4Programs.blockchainId,
            metadataCID: v4Programs.metadataCID,
            status: v4Programs.status,
          },
        })
          .from(v4Disputes)
          .leftJoin(v4Programs, eq(v4Disputes.programId, v4Programs.id))
          .where(eq(v4Disputes.blockchainId, numId))
          .limit(1);
      }
    }

    if (results.length === 0) {
      return c.json({ error: "Dispute not found" }, 404);
    }

    return c.json({ data: results[0] });
  } catch (err) {
    return c.json({ error: "Failed to fetch dispute", details: String(err) }, 500);
  }
});
