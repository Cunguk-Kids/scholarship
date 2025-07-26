import { pgTable, varchar, text, integer, numeric, timestamp, uuid, } from "drizzle-orm/pg-core";
import { MilestoneAllocationEnum, MilestoneTypeEnum } from "./enums";

export * from "./enums";

// Table Program
export const programs = pgTable("programs", {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: integer("program_id").unique(),
  name: varchar("name", { length: 255 }),
  creator: varchar("creator", { length: 255 }),
  metadataCID: varchar("metadataCID", { length: 255 }),
  description: text("description"),
  startAt: timestamp("start_at", { mode: "string" }),
  endAt: timestamp("end_at", { mode: "string" }),
  votingAt: timestamp("voting_at", { mode: "string" }),
  rules: text("rules"),
  totalRecipients: varchar("total_recipients", { length: 255 }),
  totalFund: integer("total_fund"),
  milestoneType: MilestoneAllocationEnum("milestone_type_enum"),
});

// Table Students
export const students = pgTable("students", {
  id: uuid('id').defaultRandom().primaryKey(),
  studentID: varchar("student_id").unique(),
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  financialSituation: text("financial_situation"),
  scholarshipMotivation: text("scholarship_motivation"),
  programId: integer("program_id")
    .references(() => programs.programId)
  ,
});

// Table Achievements
export const achievements = pgTable("achievements", {
  id: uuid('id').defaultRandom().primaryKey(),
  studentID: varchar("student_id", { length: 50 })
    .references(() => students.studentID)
  ,
  name: varchar("name", { length: 255 }),
  file: varchar("file", { length: 255 }),
});

// Table Milestones
export const milestones = pgTable("milestones", {
  id: uuid('id').defaultRandom().primaryKey(),
  studentID: varchar("student_id", { length: 50 })
    .references(() => students.studentID)
  ,
  type: MilestoneTypeEnum("type"),
  description: text("description"),
  estimation: integer("estimation"),
  amount: integer("amount"),
});

// Table Votes
export const votes = pgTable("votes", {
  id: uuid('id').defaultRandom().primaryKey(),
  address: varchar("address", { length: 255 }),
  programId: integer("program_id")
    .references(() => programs.programId)
  ,
  studentID: varchar("student_id", { length: 50 })
    .references(() => students.studentID)
  ,
  ipAddress: varchar("ip_address", { length: 45 }),
});