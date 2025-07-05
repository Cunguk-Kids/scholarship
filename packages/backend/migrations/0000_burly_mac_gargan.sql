CREATE TYPE "public"."milestone_type" AS ENUM('TEMPLATE', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."scholarship_status" AS ENUM('Pending', 'OpenForApplications', 'DonationClose', 'VotingOpen', 'Completed');--> statement-breakpoint
CREATE TABLE "applicants" (
	"id" varchar PRIMARY KEY NOT NULL,
	"program_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"bio" varchar NOT NULL,
	"introducing_video" varchar NOT NULL,
	"batch" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" varchar NOT NULL,
	"contract_address" varchar,
	"donator_address" varchar NOT NULL,
	"amount" numeric NOT NULL,
	"tx_hash" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "donation_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "milestone" (
	"id" varchar PRIMARY KEY NOT NULL,
	"program_id" varchar NOT NULL,
	"applicant_id" varchar NOT NULL,
	"batch" bigint NOT NULL,
	"price" numeric NOT NULL,
	"metadata" varchar NOT NULL,
	"type" "milestone_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestone_template" (
	"id" varchar PRIMARY KEY NOT NULL,
	"program_id" varchar NOT NULL,
	"batch" bigint NOT NULL,
	"price" numeric NOT NULL,
	"metadata" varchar NOT NULL,
	"type" "milestone_type" DEFAULT 'TEMPLATE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program" (
	"id" varchar PRIMARY KEY NOT NULL,
	"contract_address" varchar NOT NULL,
	"initiator_address" varchar NOT NULL,
	"metadata_cid" varchar,
	"targetApplicant" varchar,
	"status" "scholarship_status" DEFAULT 'Pending' NOT NULL,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "program_contract_address_unique" UNIQUE("contract_address")
);
--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_template" ADD CONSTRAINT "milestone_template_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;