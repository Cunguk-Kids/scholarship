import { Hono } from "hono";
import { db } from "@/db";
import { v4Programs, v4Applicants, v4Scholars, v4Milestones, v4Votes, v4Disputes } from "@/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";

export const programsRoute = new Hono();

/**
 * GET / — List all programs
 * Query params:
 *   ?status=ACTIVE          → filter by status
 *   ?initiator=0x...        → filter by initiator wallet
 *   ?limit=20               → pagination limit (default 20)
 *   ?offset=0               → pagination offset
 *   ?sort=desc              → sort by createdAt (asc|desc)
 */
programsRoute.get("/", async (c) => {
  try {
    const status = c.req.query("status");
    const initiator = c.req.query("initiator");
    const limit = Math.min(Number(c.req.query("limit") ?? 20), 100);
    const offset = Number(c.req.query("offset") ?? 0);
    const sort = c.req.query("sort") === "asc" ? asc : desc;

    const conditions = [];
    if (status) conditions.push(eq(v4Programs.status, status as NonNullable<typeof v4Programs.$inferInsert["status"]>));
    if (initiator) conditions.push(eq(v4Programs.initiator, initiator));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const programs = await db.select().from(v4Programs)
      .where(where)
      .orderBy(sort(v4Programs.createdAt))
      .limit(limit)
      .offset(offset);

    const [total] = await db.select({ count: sql<number>`count(*)` }).from(v4Programs).where(where);

    return c.json({ data: programs, total: Number(total?.count ?? 0), limit, offset });
  } catch (err) {
    return c.json({ error: "Failed to fetch programs", details: String(err) }, 500);
  }
});

/**
 * GET /:id — Single program detail with counts
 */
programsRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Try by UUID first, then by blockchainId
    let program = await db.select().from(v4Programs)
      .where(eq(v4Programs.id, id))
      .limit(1);

    if (program.length === 0) {
      const numId = Number(id);
      if (!isNaN(numId)) {
        program = await db.select().from(v4Programs)
          .where(eq(v4Programs.pid, numId))
          .limit(1);
      }
    }

    if (program.length === 0) {
      return c.json({ error: "Program not found" }, 404);
    }

    const prog = program[0]!;

    // Fetch related counts
    const [applicantCount] = await db.select({ count: sql<number>`count(*)` })
      .from(v4Applicants).where(eq(v4Applicants.programId, prog.id));
    const [scholarCount] = await db.select({ count: sql<number>`count(*)` })
      .from(v4Scholars).where(eq(v4Scholars.programId, prog.id));
    const [milestoneCount] = await db.select({ count: sql<number>`count(*)` })
      .from(v4Milestones).where(eq(v4Milestones.programId, prog.id));
    const [voteCount] = await db.select({ count: sql<number>`count(*)` })
      .from(v4Votes).where(eq(v4Votes.programId, prog.id));
    const [disputeCount] = await db.select({ count: sql<number>`count(*)` })
      .from(v4Disputes).where(eq(v4Disputes.programId, prog.id));

    return c.json({
      data: {
        ...prog,
        _counts: {
          applicants: Number(applicantCount?.count ?? 0),
          scholars: Number(scholarCount?.count ?? 0),
          milestones: Number(milestoneCount?.count ?? 0),
          votes: Number(voteCount?.count ?? 0),
          disputes: Number(disputeCount?.count ?? 0),
        },
      },
    });
  } catch (err) {
    return c.json({ error: "Failed to fetch program", details: String(err) }, 500);
  }
});

/**
 * GET /:id/applicants — Applicants for a specific program
 */
programsRoute.get("/:id/applicants", async (c) => {
  try {
    const id = c.req.param("id");
    const limit = Math.min(Number(c.req.query("limit") ?? 50), 100);
    const offset = Number(c.req.query("offset") ?? 0);

    // Resolve program UUID
    let programId = id;
    const numId = Number(id);
    if (!isNaN(numId)) {
      const [prog] = await db.select({ id: v4Programs.id })
        .from(v4Programs).where(eq(v4Programs.pid, numId));
      if (prog) programId = prog.id;
    }

    const applicants = await db.select().from(v4Applicants)
      .where(eq(v4Applicants.programId, programId))
      .orderBy(desc(v4Applicants.totalScore))
      .limit(limit)
      .offset(offset);

    return c.json({ data: applicants });
  } catch (err) {
    return c.json({ error: "Failed to fetch applicants", details: String(err) }, 500);
  }
});

/**
 * GET /:id/scholars — Scholars for a specific program
 */
programsRoute.get("/:id/scholars", async (c) => {
  try {
    const id = c.req.param("id");
    const limit = Math.min(Number(c.req.query("limit") ?? 50), 100);
    const offset = Number(c.req.query("offset") ?? 0);

    let programId = id;
    const numId = Number(id);
    if (!isNaN(numId)) {
      const [prog] = await db.select({ id: v4Programs.id })
        .from(v4Programs).where(eq(v4Programs.pid, numId));
      if (prog) programId = prog.id;
    }

    const scholars = await db.select().from(v4Scholars)
      .where(eq(v4Scholars.programId, programId))
      .orderBy(desc(v4Scholars.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({ data: scholars });
  } catch (err) {
    return c.json({ error: "Failed to fetch scholars", details: String(err) }, 500);
  }
});

/**
 * GET /:id/milestones — Milestones for a specific program
 */
programsRoute.get("/:id/milestones", async (c) => {
  try {
    const id = c.req.param("id");
    const limit = Math.min(Number(c.req.query("limit") ?? 50), 100);
    const offset = Number(c.req.query("offset") ?? 0);

    let programId = id;
    const numId = Number(id);
    if (!isNaN(numId)) {
      const [prog] = await db.select({ id: v4Programs.id })
        .from(v4Programs).where(eq(v4Programs.pid, numId));
      if (prog) programId = prog.id;
    }

    const milestones = await db.select().from(v4Milestones)
      .where(eq(v4Milestones.programId, programId))
      .orderBy(asc(v4Milestones.blockchainId))
      .limit(limit)
      .offset(offset);

    return c.json({ data: milestones });
  } catch (err) {
    return c.json({ error: "Failed to fetch milestones", details: String(err) }, 500);
  }
});

/**
 * GET /:id/votes — Votes for a specific program
 */
programsRoute.get("/:id/votes", async (c) => {
  try {
    const id = c.req.param("id");
    const limit = Math.min(Number(c.req.query("limit") ?? 50), 100);
    const offset = Number(c.req.query("offset") ?? 0);

    let programId = id;
    const numId = Number(id);
    if (!isNaN(numId)) {
      const [prog] = await db.select({ id: v4Programs.id })
        .from(v4Programs).where(eq(v4Programs.pid, numId));
      if (prog) programId = prog.id;
    }

    const votes = await db.select().from(v4Votes)
      .where(eq(v4Votes.programId, programId))
      .orderBy(desc(v4Votes.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({ data: votes });
  } catch (err) {
    return c.json({ error: "Failed to fetch votes", details: String(err) }, 500);
  }
});

/**
 * GET /:id/disputes — Disputes for a specific program
 */
programsRoute.get("/:id/disputes", async (c) => {
  try {
    const id = c.req.param("id");

    let programId = id;
    const numId = Number(id);
    if (!isNaN(numId)) {
      const [prog] = await db.select({ id: v4Programs.id })
        .from(v4Programs).where(eq(v4Programs.pid, numId));
      if (prog) programId = prog.id;
    }

    const disputes = await db.select().from(v4Disputes)
      .where(eq(v4Disputes.programId, programId))
      .orderBy(desc(v4Disputes.createdAt));

    return c.json({ data: disputes });
  } catch (err) {
    return c.json({ error: "Failed to fetch disputes", details: String(err) }, 500);
  }
});
