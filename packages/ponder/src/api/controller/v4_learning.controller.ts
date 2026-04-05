import { Context } from "hono";
import { db } from "@/db";
import { v4ExternalLearning } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendSseToAll } from "./sse.controller";

/**
 * POST /api/webhooks/progress
 * Body: { address, provider, courseId, progress, status, secret }
 */
export const upsertProgressController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { address, provider, courseId, progress, status, secret } = body;

    // 1. Verify Webhook Secret
    const expectedSecret = process.env.WEBHOOK_SECRET || "skoolchein_dev_secret_123";
    if (secret !== expectedSecret) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!address || !provider || !courseId) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // 2. Upsert Progress into Database
    // Note: Drizzle pg-core doesn't have a built-in upsert for all drivers easy, 
    // we use a manual check or onConflictDoUpdate if supported.
    await db.insert(v4ExternalLearning)
      .values({
        address: address.toLowerCase(),
        provider: provider.toLowerCase(),
        externalId: courseId,
        progress: progress ?? 0,
        status: status || "IN_PROGRESS",
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: [v4ExternalLearning.address, v4ExternalLearning.provider, v4ExternalLearning.externalId],
        set: {
          progress: progress ?? 0,
          status: status || "IN_PROGRESS",
          lastUpdated: new Date(),
        },
      });

    // 3. Notify Frontend via SSE (Real-time UI update)
    await sendSseToAll("main", { 
      event: "ExternalProgressUpdated", 
      address: address.toLowerCase(),
      courseId 
    });

    return c.json({ success: true, message: "Progress updated" });
  } catch (error) {
    console.error("[Webhook] Error updating progress:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};
