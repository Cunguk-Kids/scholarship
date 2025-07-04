import { bigint, date, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

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

export const programTable = pgTable("program", {
  id: varchar("id").primaryKey(),
  contractAddress: varchar("contract_address").notNull(),
  initiatorAddress: varchar("initiator_address").notNull(),
  metadataCid: varchar("metadata_cid"),
  targetApplicant: varchar("targetApplicant"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});