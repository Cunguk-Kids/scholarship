import { db } from "@/db";
import * as schema from "@/db/schema";
import { Hono } from "hono";
import { client, graphql, ReadonlyDrizzle } from "ponder";
import { ipfsRoute } from "./routes/upload.route";
import { serverHealthRoute } from "./routes/server.health.route";
import { voteRoute } from "./routes/vote.route";
import { cors } from "hono/cors";
import { sseRoute } from "./routes/sse.route";

const app = new Hono();

// CORS middleware
const allowedOrigins = [
  "https://skoolcein.netlify.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
app.route('/sse', sseRoute);

export default app;
export type AppType = typeof app;