import { db } from "@/db";
import * as schema from "@/db/schema";
import { Hono } from "hono";
import { client, graphql, ReadonlyDrizzle } from "ponder";
import { ipfsRoute } from "./routes/upload.route";
import { serverHealthRoute } from "./routes/server.health.route";
import { voteRoute } from "./routes/vote.route";
import { cors } from "hono/cors";

const app = new Hono();

// CORS middleware
app.use(
  "*",
  cors({
    origin: (origin, _c) => {
      return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ? origin : "http://localhost:3000";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// ponder graphql and sql

app.use("/sql/*", client({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));

app.use("/", graphql({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));
app.use("/graphql", graphql({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));

// rest api
app.route('/ipfs', ipfsRoute);
app.route('/health-server-indexer', serverHealthRoute);
app.route('/vote', voteRoute);

export default app;
export type AppType = typeof app;