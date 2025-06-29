import { defineConfig } from "drizzle-kit";

const config = defineConfig({
  dbCredentials: { url: process.env.DB_URL! },
  schema: "src/db/schema.ts",
  dialect: "postgresql",
  out: "./migrations",
});

export default config;
