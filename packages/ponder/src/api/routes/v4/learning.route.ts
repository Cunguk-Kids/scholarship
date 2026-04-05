import { Hono } from "hono";
import { db } from "@/db";
import { v4ExternalLearning } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const learningRoute = new Hono();

/**
 * GET /v4/learning/progress?address=0x...&courseId=...
 * Fetches the external learning progress for a student.
 */
learningRoute.get("/progress", async (c) => {
  const address = c.req.query("address")?.toLowerCase();
  const courseId = c.req.query("courseId");

  if (!address) {
    return c.json({ error: "Address is required" }, 400);
  }

  try {
    if (courseId) {
      // Fetch specific course progress
      const result = await db
        .select()
        .from(v4ExternalLearning)
        .where(
          and(
            eq(v4ExternalLearning.address, address),
            eq(v4ExternalLearning.externalId, courseId)
          )
        )
        .limit(1);

      return c.json(result[0] || { progress: 0, status: "NOT_STARTED" });
    } else {
      // Fetch all progress for the student
      const results = await db
        .select()
        .from(v4ExternalLearning)
        .where(eq(v4ExternalLearning.address, address));

      return c.json(results);
    }
  } catch (error) {
    console.error("[API] Error fetching external progress:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});
