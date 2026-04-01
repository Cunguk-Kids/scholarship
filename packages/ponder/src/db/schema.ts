import { pgTable, varchar, text, integer, numeric, timestamp, uuid, boolean, unique, pgEnum } from "drizzle-orm/pg-core";
import { MilestoneAllocationEnum, MilestoneTypeEnum } from "./enums";
import { relations } from "drizzle-orm";

export * from "./enums";

// ── v4 Enums ──────────────────────────────────────────────────────────────────
export const programStatusEnum     = pgEnum("program_status",    ["CREATED","APPLICATION_OPEN","SCREENING","VOTING","ACTIVE","COMPLETED","CANCELLED"]);
export const disputeTypeEnum       = pgEnum("dispute_type",      ["LIGHT_FRAUD","MILESTONE_FRAUD","HEAVY_FRAUD"]);
export const disputeStatusEnum     = pgEnum("dispute_status",    ["ACTIVE","STUDENT_CONCEDED","AUTO_GUILTY","BH_WON","BH_LOST"]);
export const studentStatusEnum     = pgEnum("student_status",    ["ACTIVE","COMPLETED","FROZEN","BLACKLISTED"]);
export const milestoneStatusEnum   = pgEnum("milestone_status",  ["PENDING","SUBMITTED","DISPUTED","COMPLETED","FROZEN"]);
export const applicationStatusEnum = pgEnum("application_status",["PENDING_REVIEW","SHORTLISTED","SCREENED_OUT","LOCKED"]);

// ══════════════════════════════════════════════════════════════════════════════
// LEGACY TABLES (v1/v2 — kept intact for backwards compatibility)
// ══════════════════════════════════════════════════════════════════════════════

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
  milestonesProgram: text("milestonesProgram").notNull().default("[]"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (program) => ({
  uniqProgram: unique().on(program.creator, program.blockchainId),
}));

export const students = pgTable("students", {
  id: uuid('id').defaultRandom().primaryKey(),
  blockchainId: integer("blockchain_id").unique(),
  studentAddress: varchar("student_address", { length: 255 }).default(""),
  programId: uuid("program_id").references(() => programs.id),
  fullName: varchar("full_name", { length: 255 }).default(""),
  email: varchar("email", { length: 255 }).default(""),
  financialSituation: text("financial_situation").default(""),
  scholarshipMotivation: text("scholarship_motivation").default(""),
  score: numeric("score").default("0"),
  summary: text("summary").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (student) => ({
  uniqVote: unique().on(student.studentAddress, student.programId),
}));

export const achievements = pgTable("achievements", {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid("student_id").references(() => students.id),
  blockchainId: integer("blockchain_id").unique(),
  name: varchar("name", { length: 255 }).default(""),
  file: varchar("file", { length: 255 }).default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

export const milestones = pgTable("milestones", {
  id: uuid('id').defaultRandom().primaryKey(),
  blockchainId: integer("blockchain_id").unique(),
  amount: numeric("amount").default("0"),
  studentId: uuid("student_id").references(() => students.id),
  programId: uuid("program_id").references(() => programs.id),
  metadataCID: varchar("metadata_cid", { length: 255 }).default(""),
  proveCID: varchar("prove_cid", { length: 255 }).default(""),
  isCollected: boolean("is_collected").default(false),
  isApproved: boolean("is_approved").default(false),
  type: MilestoneTypeEnum("type"),
  description: text("description").default(""),
  estimation: integer("estimation").default(0),
  score: numeric("score").default("0"),
  summary: text("summary").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (milestone) => ({
  uniqVote: unique().on(milestone.blockchainId, milestone.programId, milestone.studentId),
}));

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

export const indexedBlocks = pgTable("indexed_blocks", {
  id: uuid('id').defaultRandom().primaryKey(),
  eventName: varchar("event_name", { length: 255 }).default(""),
  blockNumber: integer("block_number").unique().default(0),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow()
});

export const faucetData = pgTable("faucet_data", {
  id: uuid('id').defaultRandom().primaryKey(),
  address: varchar("address", { length: 255 }).default(""),
  ipAddress: varchar("ip_address", { length: 45 }).default(""),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (faucet) => ({
  uniqFaucet: unique().on(faucet.address, faucet.ipAddress),
}));

// ══════════════════════════════════════════════════════════════════════════════
// V4 TABLES
// ══════════════════════════════════════════════════════════════════════════════

/** Full v4 program record — created on ProgramCreated, updated on ProgramStatusChanged */
export const v4Programs = pgTable("v4_programs", {
  id:                  uuid("id").defaultRandom().primaryKey(),
  blockchainId:        integer("blockchain_id").notNull().unique(),
  initiator:           varchar("initiator",    { length: 42 }).notNull(),
  metadataCID:         varchar("metadata_cid", { length: 255 }).default(""),
  status:              programStatusEnum("status").default("CREATED"),
  educationLevel:      integer("education_level").default(0),
  screeningMode:       integer("screening_mode").default(0),
  maxCandidates:       integer("max_candidates").default(0),
  targetWinners:       integer("target_winners").default(0),
  totalFund:           numeric("total_fund").default("0"),
  allocatedFund:       numeric("allocated_fund").default("0"),
  spentFund:           numeric("spent_fund").default("0"),
  applicantCount:      integer("applicant_count").default(0),
  shortlistedCount:    integer("shortlisted_count").default(0),
  activeScholarCount:  integer("active_scholar_count").default(0),
  applicationStart:    timestamp("application_start", { withTimezone: true }),
  applicationEnd:      timestamp("application_end",   { withTimezone: true }),
  votingStart:         timestamp("voting_start",       { withTimezone: true }),
  votingEnd:           timestamp("voting_end",         { withTimezone: true }),
  createdAt:           timestamp("created_at",         { withTimezone: true }).defaultNow(),
  updatedAt:           timestamp("updated_at",         { withTimezone: true }).defaultNow(),
});

/** Applicant row — updated on ScoreSubmitted, StudentShortlisted, StudentScreenedOut */
export const v4Applicants = pgTable("v4_applicants", {
  id:                  uuid("id").defaultRandom().primaryKey(),
  programId:           uuid("program_id").references(() => v4Programs.id),
  blockchainProgramId: integer("blockchain_program_id").notNull(),
  wallet:              varchar("wallet",       { length: 42 }).notNull(),
  status:              applicationStatusEnum("status").default("PENDING_REVIEW"),
  profileCID:          varchar("profile_cid",  { length: 255 }).default(""),
  documentCID:         varchar("document_cid", { length: 255 }).default(""),
  essayCID:            varchar("essay_cid",    { length: 255 }).default(""),
  screeningScore:      numeric("screening_score").default("0"),
  totalScore:          numeric("total_score").default("0"),
  retryCount:          integer("retry_count").default(0),
  createdAt:           timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt:           timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniqApplicant: unique().on(t.wallet, t.blockchainProgramId),
}));

/** Active scholar — created on ScholarSelected, updated on milestones + fraud */
export const v4Scholars = pgTable("v4_scholars", {
  id:                  uuid("id").defaultRandom().primaryKey(),
  programId:           uuid("program_id").references(() => v4Programs.id),
  blockchainProgramId: integer("blockchain_program_id").notNull(),
  wallet:              varchar("wallet",  { length: 42 }).notNull(),
  status:              studentStatusEnum("status").default("ACTIVE"),
  freezeUntil:         timestamp("freeze_until",    { withTimezone: true }),
  isBlacklisted:       boolean("is_blacklisted").default(false),
  currentMilestone:    integer("current_milestone").default(0),
  totalMilestones:     integer("total_milestones").default(0),
  totalReceived:       numeric("total_received").default("0"),
  createdAt:           timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt:           timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniqScholar: unique().on(t.wallet, t.blockchainProgramId),
}));

/** Milestone row — created on MilestoneSubmitted, updated on Completed/Frozen/Released */
export const v4Milestones = pgTable("v4_milestones", {
  id:              uuid("id").defaultRandom().primaryKey(),
  blockchainId:    integer("blockchain_id").notNull().unique(),
  programId:       uuid("program_id").references(() => v4Programs.id),
  scholarId:       uuid("scholar_id").references(() => v4Scholars.id),
  scholarWallet:   varchar("scholar_wallet", { length: 42 }),
  amount:          numeric("amount").default("0"),
  proofCID:        varchar("proof_cid", { length: 255 }).default(""),
  status:          milestoneStatusEnum("status").default("PENDING"),
  submittedAt:     timestamp("submitted_at",    { withTimezone: true }),
  disputeDeadline: timestamp("dispute_deadline", { withTimezone: true }),
  completedAt:     timestamp("completed_at",    { withTimezone: true }),
  createdAt:       timestamp("created_at",      { withTimezone: true }).defaultNow(),
  updatedAt:       timestamp("updated_at",      { withTimezone: true }).defaultNow(),
});

/** Donor vote — one per donor per program, created on VoteCast */
export const v4Votes = pgTable("v4_votes", {
  id:                  uuid("id").defaultRandom().primaryKey(),
  programId:           uuid("program_id").references(() => v4Programs.id),
  blockchainProgramId: integer("blockchain_program_id").notNull(),
  voterAddress:        varchar("voter_address",     { length: 42 }).notNull(),
  candidateAddress:    varchar("candidate_address", { length: 42 }).notNull(),
  votingWeight:        numeric("voting_weight").default("0"),
  createdAt:           timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniqVote: unique().on(t.voterAddress, t.blockchainProgramId),
}));

/** Optional confidence stake — created on ConfidenceStaked, resolved on ConfidenceStakeResolved */
export const v4ConfidenceStakes = pgTable("v4_confidence_stakes", {
  id:                  uuid("id").defaultRandom().primaryKey(),
  programId:           uuid("program_id").references(() => v4Programs.id),
  blockchainProgramId: integer("blockchain_program_id").notNull(),
  voterAddress:        varchar("voter_address",   { length: 42 }).notNull(),
  scholarAddress:      varchar("scholar_address", { length: 42 }).notNull(),
  amount:              numeric("amount").default("0"),
  isResolved:          boolean("is_resolved").default(false),
  wasSlashed:          boolean("was_slashed").default(false),
  returnedAmount:      numeric("returned_amount").default("0"),
  bonusAmount:         numeric("bonus_amount").default("0"),
  createdAt:           timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt:           timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniqStake: unique().on(t.voterAddress, t.blockchainProgramId),
}));

/** Bounty hunter dispute — created on DisputeRaised, updated through resolution */
export const v4Disputes = pgTable("v4_disputes", {
  id:                  uuid("id").defaultRandom().primaryKey(),
  blockchainId:        integer("blockchain_id").notNull().unique(),
  programId:           uuid("program_id").references(() => v4Programs.id),
  milestoneId:         integer("milestone_id"),       // 0 = program-level dispute
  scholarAddress:      varchar("scholar_address", { length: 42 }).notNull(),
  bountyHunter:        varchar("bounty_hunter",   { length: 42 }).notNull(),
  disputeType:         disputeTypeEnum("dispute_type").notNull(),
  status:              disputeStatusEnum("status").default("ACTIVE"),
  evidenceCID:         varchar("evidence_cid",          { length: 255 }).default(""),
  counterEvidenceCID:  varchar("counter_evidence_cid",  { length: 255 }).default(""),
  stake:               numeric("stake").default("0"),
  potentialReward:     numeric("potential_reward").default("0"),
  bhRewardPaid:        numeric("bh_reward_paid").default("0"),
  raisedAt:            timestamp("raised_at",      { withTimezone: true }),
  defenseDeadline:     timestamp("defense_deadline", { withTimezone: true }),
  resolvedAt:          timestamp("resolved_at",    { withTimezone: true }),
  createdAt:           timestamp("created_at",     { withTimezone: true }).defaultNow(),
  updatedAt:           timestamp("updated_at",     { withTimezone: true }).defaultNow(),
});

/** REP balance per address — upserted on ReputationMinted / ReputationBurned */
export const v4Reputation = pgTable("v4_reputation", {
  id:                uuid("id").defaultRandom().primaryKey(),
  address:           varchar("address", { length: 42 }).notNull().unique(),
  repBalance:        numeric("rep_balance").default("0"),
  totalMinted:       numeric("total_minted").default("0"),
  totalBurned:       numeric("total_burned").default("0"),
  votingLockedUntil: timestamp("voting_locked_until", { withTimezone: true }),
  createdAt:         timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt:         timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ══════════════════════════════════════════════════════════════════════════════
// RELATIONS
// ══════════════════════════════════════════════════════════════════════════════

// Legacy
export const programRelations = relations(programs, ({ many }) => ({
  students: many(students), milestones: many(milestones), votes: many(votes),
}));
export const studentRelations = relations(students, ({ one, many }) => ({
  program: one(programs, { fields: [students.programId], references: [programs.id] }),
  milestones: many(milestones), achievements: many(achievements), votes: many(votes),
}));
export const milestoneRelations = relations(milestones, ({ one }) => ({
  student: one(students, { fields: [milestones.studentId], references: [students.id] }),
  program: one(programs,  { fields: [milestones.programId], references: [programs.id] }),
}));
export const voteRelations = relations(votes, ({ one }) => ({
  student: one(students, { fields: [votes.studentId], references: [students.id] }),
  program: one(programs,  { fields: [votes.programId],  references: [programs.id] }),
}));
export const achievementRelations = relations(achievements, ({ one }) => ({
  student: one(students, { fields: [achievements.studentId], references: [students.id] }),
}));

// V4
export const v4ProgramRelations = relations(v4Programs, ({ many }) => ({
  applicants: many(v4Applicants), scholars: many(v4Scholars),
  milestones: many(v4Milestones), votes: many(v4Votes),
  confidenceStakes: many(v4ConfidenceStakes), disputes: many(v4Disputes),
}));
export const v4ApplicantRelations = relations(v4Applicants, ({ one }) => ({
  program: one(v4Programs, { fields: [v4Applicants.programId], references: [v4Programs.id] }),
}));
export const v4ScholarRelations = relations(v4Scholars, ({ one, many }) => ({
  program: one(v4Programs, { fields: [v4Scholars.programId], references: [v4Programs.id] }),
  milestones: many(v4Milestones),
}));
export const v4MilestoneRelations = relations(v4Milestones, ({ one }) => ({
  program: one(v4Programs, { fields: [v4Milestones.programId], references: [v4Programs.id] }),
  scholar: one(v4Scholars, { fields: [v4Milestones.scholarId], references: [v4Scholars.id] }),
}));
export const v4VoteRelations = relations(v4Votes, ({ one }) => ({
  program: one(v4Programs, { fields: [v4Votes.programId], references: [v4Programs.id] }),
}));
export const v4DisputeRelations = relations(v4Disputes, ({ one }) => ({
  program: one(v4Programs, { fields: [v4Disputes.programId], references: [v4Programs.id] }),
}));
export const v4ConfidenceStakeRelations = relations(v4ConfidenceStakes, ({ one }) => ({
  program: one(v4Programs, { fields: [v4ConfidenceStakes.programId], references: [v4Programs.id] }),
}));
