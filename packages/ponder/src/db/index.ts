// db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { ReadonlyDrizzle } from "ponder";

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
  // connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });
