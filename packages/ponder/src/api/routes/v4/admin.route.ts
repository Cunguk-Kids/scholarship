import { Hono } from "hono";
import { db } from "@/db";
import { v4Programs, v4Applicants, v4Scholars, v4Milestones, v4Disputes } from "@/db/schema";
import { sql } from "drizzle-orm";

export const adminRoute = new Hono();

/**
 * GET / — Admin overview
 * Returns aggregate counts of the entire protocol.
 */
adminRoute.get("/", async (c) => {
  try {
    const [programCount] = await db.select({ count: sql<number>`count(*)` }).from(v4Programs);
    const [applicantCount] = await db.select({ count: sql<number>`count(*)` }).from(v4Applicants);
    const [scholarCount] = await db.select({ count: sql<number>`count(*)` }).from(v4Scholars);
    const [milestoneCount] = await db.select({ count: sql<number>`count(*)` }).from(v4Milestones);
    const [disputeCount] = await db.select({ count: sql<number>`count(*)` }).from(v4Disputes);

    // Get unique program creators
    const [uniqueCreators] = await db.select({ count: sql<number>`count(distinct initiator)` }).from(v4Programs);

    return c.json({
      data: {
        totalPrograms: Number(programCount?.count ?? 0),
        totalApplicants: Number(applicantCount?.count ?? 0),
        totalScholars: Number(scholarCount?.count ?? 0),
        totalMilestones: Number(milestoneCount?.count ?? 0),
        totalDisputes: Number(disputeCount?.count ?? 0),
        totalCreators: Number(uniqueCreators?.count ?? 0),
      }
    });
  } catch (err) {
    return c.json({ error: "Failed to fetch admin overview", details: String(err) }, 500);
  }
});
