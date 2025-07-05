// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";
import * as schema from './schema';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DB_URL!});
// const nn = neon(process.env.DB_URL!);
console.log(pool);

export const db = drizzle({ client: pool, schema });
