import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from './schema';

export const db = drizzle({ client: neon(process.env.DB_URL!), schema });
