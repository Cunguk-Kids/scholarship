import { Hono } from "hono";
import { upsertProgressController } from "../controller/v4_learning.controller";

export const webhooksRoute = new Hono();

/**
 * Endpoint for 3rd party learning platforms (HackQuest/Udemy)
 * POST /api/webhooks/progress
 */
webhooksRoute.post("/progress", upsertProgressController);
