import { db } from "@/db";
import * as schema from "@/db/schema";
import { Hono } from "hono";
import { client, graphql, ReadonlyDrizzle } from "ponder";
import { cors } from "hono/cors";

// Shared services (kept — version-agnostic)
import { ipfsRoute } from "./routes/upload.route";
import { serverHealthRoute } from "./routes/server.health.route";
import { sseRoute } from "./routes/sse.route";
import { sendSseToAll } from "./controller/sse.controller";

// v4 API routes
import { v4Routes } from "./routes/v4";

const app = new Hono();

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);
app.options("*", cors());

// ── Ponder built-in GraphQL & SQL endpoints ─────────────────────────────────
app.use("/sql/*", client({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));
app.use("/", graphql({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));
app.use("/graphql", graphql({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));

// ── Shared service routes ───────────────────────────────────────────────────
app.route("/ipfs", ipfsRoute);
app.route("/health-server-indexer", serverHealthRoute);
app.route("/sse", sseRoute);

app.get("/trigger", async (c) => {
  await sendSseToAll("main", { hello: "world", timestamp: Date.now() });
  return c.text("Triggered");
});

// ── v4 REST API ─────────────────────────────────────────────────────────────
app.route("/v4", v4Routes);

export default app;
export type AppType = typeof app;