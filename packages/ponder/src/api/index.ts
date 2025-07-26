import { db } from "@/db";
import * as schema from "@/db/schema";
import { Hono } from "hono";
import { client, graphql, ReadonlyDrizzle } from "ponder";

const app = new Hono();

app.use("/sql/*", client({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));

app.use("/", graphql({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));
app.use("/graphql", graphql({ db: db as unknown as ReadonlyDrizzle<typeof schema>, schema }));

export default app;