import { pgTable, varchar, text, integer, numeric, timestamp, uuid, boolean, unique, } from "drizzle-orm/pg-core";
import { MilestoneAllocationEnum, MilestoneTypeEnum } from "./enums";
import { relations } from "drizzle-orm";

export * from "./enums";

// Table Program
export const programs = pgTable("programs", {
  id: uuid('id').defaultRandom().primaryKey(),
  blockchainId: integer("blockchain_id").unique(),
  name: varchar("name", { length: 255 }).default("Untitled Program"),
  creator: varchar("creator", { length: 255 }),
  metadataCID: varchar("metadata_cid", { length: 255 }).default(""),
  description: text("description").default(""),
  startAt: timestamp("start_at", { mode: "string" }),
  endAt: timestamp("end_at", { mode: "string" }),
  votingAt: timestamp("voting_at", { mode: "string" }).defaultNow(),
  ongoingAt: timestamp("ongoing_at", { mode: "string" }).defaultNow(),
  rules: text("rules").default(""),
  totalRecipients: integer("total_recipients").default(0),
  totalFund: integer("total_fund").default(0),
  milestoneType: MilestoneAllocationEnum("milestone_type_enum"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});
// Table Students
export const students = pgTable("students", {
  id: uuid('id').defaultRandom().primaryKey(),
  blockchainId: integer("blockchain_id").unique(),
  studentAddress: varchar("student_address", { length: 255 }).default(""),
  programId: uuid("program_id").references(() => programs.id),
  fullName: varchar("full_name", { length: 255 }).default(""),
  email: varchar("email", { length: 255 }).default(""),
  financialSituation: text("financial_situation").default(""),
  scholarshipMotivation: text("scholarship_motivation").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Table Achievements
export const achievements = pgTable("achievements", {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid("student_id").references(() => students.id),
  blockchainId: integer("blockchain_id").unique(),
  name: varchar("name", { length: 255 }).default(""),
  file: varchar("file", { length: 255 }).default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Table Milestones
export const milestones = pgTable("milestones", {
  id: uuid('id').defaultRandom().primaryKey(),
  blockchainId: integer("blockchain_id").unique(),
  amount: integer("amount").default(0),
  studentId: uuid("student_id").references(() => students.id),
  programId: uuid("program_id").references(() => programs.id),
  metadataCID: varchar("metadata_cid", { length: 255 }).default(""),
  proveCID: varchar("prove_cid", { length: 255 }).default(""),
  isCollected: boolean("is_collected").default(false),
  type: MilestoneTypeEnum("type"),
  description: text("description").default(""),
  estimation: integer("estimation").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Table Votes
export const votes = pgTable("votes", {
  id: uuid('id').defaultRandom().primaryKey(),
  address: varchar("address", { length: 255 }).default(""),
  programId: uuid("program_id").references(() => programs.id),
  studentId: uuid("student_id").references(() => students.id),
  blockchainProgramId: integer("blockchain_program_id"),
  blockchainStudentId: integer("blockchain_student_id"),
  ipAddress: varchar("ip_address", { length: 45 }).default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (votes) => ({
  uniqVote: unique().on(votes.address, votes.programId, votes.studentId),
}));

// Table Indexed Blocks
export const indexedBlocks = pgTable("indexed_blocks", {
  id: uuid('id').defaultRandom().primaryKey(),
  eventName: varchar("event_name", { length: 255 }).default(""),
  blockNumber: integer("block_number").unique().default(0),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow()
});


// Program → Students, Milestones, Votes
export const programRelations = relations(programs, ({ many }) => ({
  students: many(students),
  milestones: many(milestones),
  votes: many(votes),
}));

// Student → Program, Milestones, Achievements, Votes
export const studentRelations = relations(students, ({ one, many }) => ({
  program: one(programs, {
    fields: [students.programId],
    references: [programs.id],
  }),
  milestones: many(milestones),
  achievements: many(achievements),
  votes: many(votes),
}));

// Milestone → Student & Program
export const milestoneRelations = relations(milestones, ({ one }) => ({
  student: one(students, {
    fields: [milestones.studentId],
    references: [students.id],
  }),
  program: one(programs, {
    fields: [milestones.programId],
    references: [programs.id],
  }),
}));

// Vote → Student & Program
export const voteRelations = relations(votes, ({ one }) => ({
  student: one(students, {
    fields: [votes.studentId],
    references: [students.id],
  }),
  program: one(programs, {
    fields: [votes.programId],
    references: [programs.id],
  }),
}));

// Achievement → Student
export const achievementRelations = relations(achievements, ({ one }) => ({
  student: one(students, {
    fields: [achievements.studentId],
    references: [students.id],
  }),
}));
