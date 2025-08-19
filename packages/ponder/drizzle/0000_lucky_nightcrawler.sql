CREATE TYPE "public"."milestone_allocation_type" AS ENUM('FIXED', 'USER_DEFINED');--> statement-breakpoint
CREATE TYPE "public"."milestone_type" AS ENUM('Tuition', 'Equipment', 'Living_Cost', 'Project', 'Others');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid,
	"blockchain_id" integer,
	"name" varchar(255) DEFAULT '',
	"file" varchar(255) DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "achievements_blockchain_id_unique" UNIQUE("blockchain_id")
);
--> statement-breakpoint
CREATE TABLE "faucet_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(255) DEFAULT '',
	"ip_address" varchar(45) DEFAULT '',
	"timestamp" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "faucet_data_address_ip_address_unique" UNIQUE("address","ip_address")
);
--> statement-breakpoint
CREATE TABLE "indexed_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" varchar(255) DEFAULT '',
	"block_number" integer DEFAULT 0,
	"timestamp" timestamp with time zone DEFAULT now(),
	CONSTRAINT "indexed_blocks_block_number_unique" UNIQUE("block_number")
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blockchain_id" integer,
	"amount" numeric DEFAULT '0',
	"student_id" uuid,
	"program_id" uuid,
	"metadata_cid" varchar(255) DEFAULT '',
	"prove_cid" varchar(255) DEFAULT '',
	"is_collected" boolean DEFAULT false,
	"is_approved" boolean DEFAULT false,
	"type" "milestone_type",
	"description" text DEFAULT '',
	"estimation" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "milestones_blockchain_id_unique" UNIQUE("blockchain_id"),
	CONSTRAINT "milestones_blockchain_id_program_id_student_id_unique" UNIQUE("blockchain_id","program_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blockchain_id" integer,
	"name" varchar(255) DEFAULT 'Untitled Program',
	"creator" varchar(255),
	"metadata_cid" varchar(255) DEFAULT '',
	"description" text DEFAULT '',
	"start_at" timestamp,
	"end_at" timestamp,
	"voting_at" timestamp DEFAULT now(),
	"ongoing_at" timestamp DEFAULT now(),
	"rules" text DEFAULT '',
	"total_recipients" integer DEFAULT 0,
	"total_fund" integer DEFAULT 0,
	"milestone_type_enum" "milestone_allocation_type",
	"milestones" text DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "programs_blockchain_id_unique" UNIQUE("blockchain_id")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blockchain_id" integer,
	"student_address" varchar(255) DEFAULT '',
	"program_id" uuid,
	"full_name" varchar(255) DEFAULT '',
	"email" varchar(255) DEFAULT '',
	"financial_situation" text DEFAULT '',
	"scholarship_motivation" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "students_blockchain_id_unique" UNIQUE("blockchain_id"),
	CONSTRAINT "students_student_address_program_id_unique" UNIQUE("student_address","program_id")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(255) DEFAULT '',
	"program_id" uuid,
	"student_id" uuid,
	"blockchain_program_id" integer,
	"blockchain_student_id" integer,
	"ip_address" varchar(45) DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "votes_address_program_id_student_id_unique" UNIQUE("address","program_id","student_id")
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;