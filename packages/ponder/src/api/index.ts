import { db } from "@/db";
import * as schema from "@/db/schema";
import { Hono } from "hono";
import { client, graphql, ReadonlyDrizzle } from "ponder";
import { ipfsRoute } from "./routes/upload.route";
import { serverHealthRoute } from "./routes/server.health.route";

const app = new Hono();

app.use("/sql/*", client({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));

app.use("/", graphql({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));
app.use("/graphql", graphql({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));

// rest api
app.route('/ipfs', ipfsRoute);
app.route('/health-server-indexer', serverHealthRoute);

export default app;
export type AppType = typeof app;