import { db } from "@/db";
import * as schema from "@/db/schema";
import { Hono } from "hono";
import { client, graphql, ReadonlyDrizzle } from "ponder";
import { ipfsRoute } from "./routes/upload.route";
import { serverHealthRoute } from "./routes/server.health.route";
import { voteRoute } from "./routes/vote.route";
import { cors } from "hono/cors";
import { sseRoute } from "./routes/sse.route";
import { sendSseToAll } from "./controller/sse.controller";

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
    credentials: false,
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
app.get('/trigger', async (c) => {
  await sendSseToAll('main', { hello: 'world', timestamp: Date.now() });
  return c.text('Triggered');
});

export default app;
export type AppType = typeof app;