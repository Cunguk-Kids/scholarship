import { relations } from "drizzle-orm";
import { uuid, bigint, date, pgTable, varchar, timestamp, numeric } from "drizzle-orm/pg-core";
import { milestoneType, scholarshipStatusEnum } from "./enum";
export * from "./enum";

export const applicantTable = pgTable("applicants", {
  id: varchar("id").primaryKey(), // id must format batch_id
  programId: varchar("program_id")
    .notNull()
    .references(() => programTable.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  bio: varchar("bio").notNull(),
  introducingVideo: varchar("introducing_video").notNull(),
  batch: bigint("batch", { mode: "number" }).notNull(),
});

export const programTable = pgTable("program", {
  id: varchar("id").primaryKey(), // id from program id
  contractAddress: varchar("contract_address").notNull().unique(),
  initiatorAddress: varchar("initiator_address").notNull(),
  metadataCid: varchar("metadata_cid"),
  targetApplicant: varchar("targetApplicant"),
  status: scholarshipStatusEnum("status").notNull().default("Pending"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const donationTable = pgTable("donation", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: varchar("program_id")
    .notNull()
    .references(() => programTable.id, { onDelete: "cascade" }),
  contractAddress: varchar("contract_address"),
  donatorAddress: varchar("donator_address").notNull(),
  amount: numeric("amount").notNull(),
  txHash: varchar("tx_hash").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const milestoneTemplateTable = pgTable("milestone_template", {
  id: varchar("id").primaryKey(), // id must format milestoneid
  programId: varchar("program_id")
    .notNull()
    .references(() => programTable.id, { onDelete: "cascade" }),
  batch: bigint("batch", { mode: "number" }).notNull(),
  price: numeric("price").notNull(),
  metadata: varchar("metadata").notNull(),
  type: milestoneType("type").notNull().default("TEMPLATE")
});


export const milestoneTable = pgTable("milestone", {
  id: varchar("id").primaryKey(), // id must format batch_id
  programId: varchar("program_id")
    .notNull()
    .references(() => programTable.id, { onDelete: "cascade" }),
  applicantId: varchar("applicant_id")
    .notNull()
    .references(() => applicantTable.id, { onDelete: "cascade" }),
  batch: bigint("batch", { mode: "number" }).notNull(),
  price: numeric("price").notNull(),
  metadata: varchar("metadata").notNull(),
  type: milestoneType("type").notNull()
});

// RELATION
export const programRelations = relations(programTable, ({ many }) => ({
  donations: many(donationTable),
  milestoneTemplates: many(milestoneTemplateTable),
  milestones: many(milestoneTable),
  applicants: many(applicantTable)
}));

export const donationRelations = relations(donationTable, ({ one }) => ({
  program: one(programTable, {
    fields: [donationTable.programId],
    references: [programTable.id],
  }),
}));

export const milestoneTemplateRelations = relations(milestoneTemplateTable, ({ one }) => ({
  program: one(programTable, {
    fields: [milestoneTemplateTable.programId],
    references: [programTable.id],
  }),
}));

export const milestoneRelations = relations(milestoneTable, ({ one }) => ({
  program: one(programTable, {
    fields: [milestoneTable.programId],
    references: [programTable.id],
  }),
}));

export const applicantRelations = relations(applicantTable, ({ one }) => ({
  program: one(programTable, {
    fields: [applicantTable.programId],
    references: [programTable.id],
  }),
}));