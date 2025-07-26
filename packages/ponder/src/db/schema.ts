import { pgTable, varchar, text, integer, numeric, timestamp, uuid, boolean, } from "drizzle-orm/pg-core";
import { MilestoneAllocationEnum, MilestoneTypeEnum } from "./enums";

export * from "./enums";

// Table Program
export const programs = pgTable("programs", {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: integer("program_id").unique(),
  name: varchar("name", { length: 255 }),
  creator: varchar("creator", { length: 255 }),
  metadataCID: varchar("metadata_cid", { length: 255 }),
  description: text("description"),
  startAt: timestamp("start_at", { mode: "string" }),
  endAt: timestamp("end_at", { mode: "string" }),
  votingAt: timestamp("voting_at", { mode: "string" }),
  rules: text("rules"),
  totalRecipients: varchar("total_recipients", { length: 255 }),
  totalFund: integer("total_fund"),
  milestoneType: MilestoneAllocationEnum("milestone_type_enum"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Table Students
export const students = pgTable("students", {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: integer("student_id").unique(),
  studentAddress: varchar("student_address"),
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  financialSituation: text("financial_situation"),
  scholarshipMotivation: text("scholarship_motivation"),
  programId: integer("program_id")
    .references(() => programs.programId)
  ,
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Table Achievements
export const achievements = pgTable("achievements", {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: integer("student_id")
    .references(() => students.studentId)
  ,
  name: varchar("name", { length: 255 }),
  file: varchar("file", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Table Milestones
export const milestones = pgTable("milestones", {
  id: uuid('id').defaultRandom().primaryKey(),
  milestoneId: integer("milestone_id").unique(),
  isCollected: boolean("is_collected"),
  studentId: integer("student_id")
    .references(() => students.studentId)
  ,
  programId: integer("program_id")
    .references(() => programs.programId)
  ,
  type: MilestoneTypeEnum("type"),
  description: text("description"),
  estimation: integer("estimation"),
  amount: integer("amount"),
  metadataCID: varchar("metadata_cid", { length: 255 }),
  proveCID: varchar("prove_cid", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Table Votes
export const votes = pgTable("votes", {
  id: uuid('id').defaultRandom().primaryKey(),
  address: varchar("address", { length: 255 }),
  programId: integer("program_id")
    .references(() => programs.programId)
  ,
  studentId: integer("student_id")
    .references(() => students.studentId)
  ,
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Blocknumber
export const indexedBlocks = pgTable("indexed_blocks", {
  id: uuid('id').defaultRandom().primaryKey(),
  eventName: varchar("event_name", { length: 255 }),
  blockNumber: integer("block_number").unique(),
  timestamp: timestamp("timestamp", { withTimezone: true }),
});