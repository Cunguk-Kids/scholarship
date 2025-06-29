import { bigint, pgTable, varchar } from "drizzle-orm/pg-core";

export const applicantTable = pgTable("applicants", {
  id: varchar("id").primaryKey(), // id must format batch_id
  name: varchar("name").notNull(),
  bio: varchar("bio").notNull(),
  introducingVideo: varchar("introducing_video").notNull(),
  batch: bigint("batch", { mode: "number" }).notNull(),
});

export const milestoneTable = pgTable("milestone", {
  id: varchar("id").primaryKey(), // id must format batch_id
  batch: bigint("batch", { mode: "number" }).notNull(),
  title: varchar("title").notNull(),
});
