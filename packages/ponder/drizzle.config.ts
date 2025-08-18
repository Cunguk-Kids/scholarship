import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // host: process.env.DB_HOST!,
    // user: process.env.DB_USER!,
    // password: process.env.DB_PASSWORD!,
    // database: process.env.DB_NAME!,
    // port: 5432,
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    schema: "public",
  },
});
