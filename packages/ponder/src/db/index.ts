// db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { ReadonlyDrizzle } from "ponder";

const pool = new Pool({
  host: 'ep-purple-pond-admrht0o-pooler.c-2.us-east-1.aws.neon.tech',
  user: 'neondb_owner',
  password: 'npg_J9NPIGmL6BSd',
  database: 'neondb',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
  // connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });
