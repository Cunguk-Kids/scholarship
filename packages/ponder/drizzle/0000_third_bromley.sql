CREATE TYPE "public"."application_status" AS ENUM('PENDING_REVIEW', 'SHORTLISTED', 'SCREENED_OUT', 'LOCKED');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('ACTIVE', 'STUDENT_CONCEDED', 'AUTO_GUILTY', 'BH_WON', 'BH_LOST');--> statement-breakpoint
CREATE TYPE "public"."dispute_type" AS ENUM('LIGHT_FRAUD', 'MILESTONE_FRAUD', 'HEAVY_FRAUD');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('PENDING', 'SUBMITTED', 'DISPUTED', 'COMPLETED', 'FROZEN');--> statement-breakpoint
CREATE TYPE "public"."program_status" AS ENUM('CREATED', 'APPLICATION_OPEN', 'SCREENING', 'VOTING', 'ACTIVE', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."student_status" AS ENUM('ACTIVE', 'COMPLETED', 'FROZEN', 'BLACKLISTED');--> statement-breakpoint
CREATE TABLE "indexed_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" varchar(255) DEFAULT '',
	"block_number" integer DEFAULT 0,
	"timestamp" timestamp with time zone DEFAULT now(),
	CONSTRAINT "indexed_blocks_block_number_unique" UNIQUE("block_number")
);
--> statement-breakpoint
CREATE TABLE "v4_applicants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid,
	"blockchain_program_id" integer NOT NULL,
	"wallet" varchar(42) NOT NULL,
	"status" "application_status" DEFAULT 'PENDING_REVIEW',
	"profile_cid" varchar(255) DEFAULT '',
	"document_cid" varchar(255) DEFAULT '',
	"essay_cid" varchar(255) DEFAULT '',
	"screening_score" numeric DEFAULT '0',
	"total_score" numeric DEFAULT '0',
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_applicants_wallet_blockchain_program_id_unique" UNIQUE("wallet","blockchain_program_id")
);
--> statement-breakpoint
CREATE TABLE "v4_bounty_hunters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(42) NOT NULL,
	"total_disputes" integer DEFAULT 0,
	"total_wins" integer DEFAULT 0,
	"total_losses" integer DEFAULT 0,
	"total_rewards" numeric DEFAULT '0',
	"is_flagged" boolean DEFAULT false,
	"cooldown_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_bounty_hunters_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "v4_committee_dispute_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispute_id" integer NOT NULL,
	"member_address" varchar(42) NOT NULL,
	"uphold_dispute" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_committee_dispute_votes_dispute_id_member_address_unique" UNIQUE("dispute_id","member_address")
);
--> statement-breakpoint
CREATE TABLE "v4_committee_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid,
	"blockchain_program_id" integer NOT NULL,
	"member_address" varchar(42) NOT NULL,
	"is_active" boolean DEFAULT true,
	"added_at" timestamp with time zone DEFAULT now(),
	"removed_at" timestamp with time zone,
	CONSTRAINT "v4_committee_members_member_address_blockchain_program_id_unique" UNIQUE("member_address","blockchain_program_id")
);
--> statement-breakpoint
CREATE TABLE "v4_confidence_stakes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid,
	"blockchain_program_id" integer NOT NULL,
	"voter_address" varchar(42) NOT NULL,
	"scholar_address" varchar(42) NOT NULL,
	"amount" numeric DEFAULT '0',
	"is_resolved" boolean DEFAULT false,
	"was_slashed" boolean DEFAULT false,
	"returned_amount" numeric DEFAULT '0',
	"bonus_amount" numeric DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_confidence_stakes_voter_address_blockchain_program_id_unique" UNIQUE("voter_address","blockchain_program_id")
);
--> statement-breakpoint
CREATE TABLE "v4_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blockchain_id" integer NOT NULL,
	"program_id" uuid,
	"milestone_id" integer,
	"scholar_address" varchar(42) NOT NULL,
	"bounty_hunter" varchar(42) NOT NULL,
	"dispute_type" "dispute_type" NOT NULL,
	"status" "dispute_status" DEFAULT 'ACTIVE',
	"evidence_cid" varchar(255) DEFAULT '',
	"counter_evidence_cid" varchar(255) DEFAULT '',
	"stake" numeric DEFAULT '0',
	"potential_reward" numeric DEFAULT '0',
	"bh_reward_paid" numeric DEFAULT '0',
	"raised_at" timestamp with time zone,
	"defense_deadline" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_disputes_blockchain_id_unique" UNIQUE("blockchain_id")
);
--> statement-breakpoint
CREATE TABLE "v4_donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid,
	"blockchain_program_id" integer NOT NULL,
	"donor" varchar(42) NOT NULL,
	"gross_amount" numeric DEFAULT '0',
	"net_amount" numeric DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "v4_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blockchain_id" integer NOT NULL,
	"program_id" uuid,
	"scholar_id" uuid,
	"scholar_wallet" varchar(42),
	"amount" numeric DEFAULT '0',
	"proof_cid" varchar(255) DEFAULT '',
	"status" "milestone_status" DEFAULT 'PENDING',
	"submitted_at" timestamp with time zone,
	"dispute_deadline" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_milestones_blockchain_id_unique" UNIQUE("blockchain_id")
);
--> statement-breakpoint
CREATE TABLE "v4_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blockchain_id" integer NOT NULL,
	"initiator" varchar(42) NOT NULL,
	"metadata_cid" varchar(255) DEFAULT '',
	"status" "program_status" DEFAULT 'CREATED',
	"education_level" integer DEFAULT 0,
	"screening_mode" integer DEFAULT 0,
	"max_candidates" integer DEFAULT 0,
	"target_winners" integer DEFAULT 0,
	"committee_contract" varchar(42) DEFAULT '',
	"total_fund" numeric DEFAULT '0',
	"allocated_fund" numeric DEFAULT '0',
	"spent_fund" numeric DEFAULT '0',
	"yield_accrued" numeric DEFAULT '0',
	"applicant_count" integer DEFAULT 0,
	"shortlisted_count" integer DEFAULT 0,
	"active_scholar_count" integer DEFAULT 0,
	"application_start" timestamp with time zone,
	"application_end" timestamp with time zone,
	"voting_start" timestamp with time zone,
	"voting_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_programs_blockchain_id_unique" UNIQUE("blockchain_id")
);
--> statement-breakpoint
CREATE TABLE "v4_reputation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(42) NOT NULL,
	"rep_balance" numeric DEFAULT '0',
	"total_minted" numeric DEFAULT '0',
	"total_burned" numeric DEFAULT '0',
	"voting_locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_reputation_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "v4_scholars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid,
	"blockchain_program_id" integer NOT NULL,
	"wallet" varchar(42) NOT NULL,
	"status" "student_status" DEFAULT 'ACTIVE',
	"freeze_until" timestamp with time zone,
	"is_blacklisted" boolean DEFAULT false,
	"current_milestone" integer DEFAULT 0,
	"total_milestones" integer DEFAULT 0,
	"total_received" numeric DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_scholars_wallet_blockchain_program_id_unique" UNIQUE("wallet","blockchain_program_id")
);
--> statement-breakpoint
CREATE TABLE "v4_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid,
	"blockchain_program_id" integer NOT NULL,
	"voter_address" varchar(42) NOT NULL,
	"candidate_address" varchar(42) NOT NULL,
	"voting_weight" numeric DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_votes_voter_address_blockchain_program_id_unique" UNIQUE("voter_address","blockchain_program_id")
);
--> statement-breakpoint
ALTER TABLE "v4_applicants" ADD CONSTRAINT "v4_applicants_program_id_v4_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."v4_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v4_committee_members" ADD CONSTRAINT "v4_committee_members_program_id_v4_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."v4_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v4_confidence_stakes" ADD CONSTRAINT "v4_confidence_stakes_program_id_v4_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."v4_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v4_disputes" ADD CONSTRAINT "v4_disputes_program_id_v4_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."v4_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v4_donations" ADD CONSTRAINT "v4_donations_program_id_v4_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."v4_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v4_milestones" ADD CONSTRAINT "v4_milestones_program_id_v4_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."v4_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v4_milestones" ADD CONSTRAINT "v4_milestones_scholar_id_v4_scholars_id_fk" FOREIGN KEY ("scholar_id") REFERENCES "public"."v4_scholars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v4_scholars" ADD CONSTRAINT "v4_scholars_program_id_v4_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."v4_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v4_votes" ADD CONSTRAINT "v4_votes_program_id_v4_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."v4_programs"("id") ON DELETE no action ON UPDATE no action;