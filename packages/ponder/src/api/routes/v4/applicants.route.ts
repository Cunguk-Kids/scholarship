import { Hono } from "hono";
import { db } from "@/db";
import { v4Applicants, v4Programs } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const applicantsRoute = new Hono();

/**
 * GET / — List applicants
 * Query params:
 *   ?wallet=0x...      → filter by student wallet
 *   ?status=SHORTLISTED → filter by status
 *   ?limit=20          → pagination limit
 *   ?offset=0          → pagination offset
 */
applicantsRoute.get("/", async (c) => {
  try {
    const wallet = c.req.query("wallet");
    const status = c.req.query("status");
    const limit = Math.min(Number(c.req.query("limit") ?? 20), 100);
    const offset = Number(c.req.query("offset") ?? 0);

    const conditions = [];
    if (wallet) conditions.push(eq(v4Applicants.wallet, wallet));
    if (status) conditions.push(eq(v4Applicants.status, status as NonNullable<typeof v4Applicants.$inferInsert["status"]>));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const applicants = await db.select({
      applicant: v4Applicants,
      program: {
        id: v4Programs.id,
        pid: v4Programs.pid,
        metadataCID: v4Programs.metadataCID,
        status: v4Programs.status,
        initiator: v4Programs.initiator,
        totalFund: v4Programs.totalFund,
      },
    })
      .from(v4Applicants)
      .leftJoin(v4Programs, eq(v4Applicants.programId, v4Programs.id))
      .where(where)
      .orderBy(desc(v4Applicants.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({ data: applicants });
  } catch (err) {
    return c.json({ error: "Failed to fetch applicants", details: String(err) }, 500);
  }
});

/**
 * GET /:id — Single applicant by UUID
 */
applicantsRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const [applicant] = await db.select({
      applicant: v4Applicants,
      program: {
        id: v4Programs.id,
        pid: v4Programs.pid,
        metadataCID: v4Programs.metadataCID,
        status: v4Programs.status,
      },
    })
      .from(v4Applicants)
      .leftJoin(v4Programs, eq(v4Applicants.programId, v4Programs.id))
      .where(eq(v4Applicants.id, id))
      .limit(1);

    if (!applicant) {
      return c.json({ error: "Applicant not found" }, 404);
    }

    return c.json({ data: applicant });
  } catch (err) {
    return c.json({ error: "Failed to fetch applicant", details: String(err) }, 500);
  }
});
