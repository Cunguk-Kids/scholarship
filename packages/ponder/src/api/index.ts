import { db } from "@/db";
import * as schema from "@/db/schema";
import { Hono } from "hono";
import { client, graphql, ReadonlyDrizzle } from "ponder";
import { ipfsRoute } from "./routes/upload.route";

const app = new Hono();

app.use("/sql/*", client({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));

app.use("/", graphql({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));
app.use("/graphql", graphql({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));

// rest api
app.route('/ipfs', ipfsRoute);

export default app;