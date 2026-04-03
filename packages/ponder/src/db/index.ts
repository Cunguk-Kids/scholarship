// db.ts — Database connection (Drizzle + PostgreSQL)
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT ?? 6543),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
