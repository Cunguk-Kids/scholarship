ALTER TYPE "public"."milestone_status" ADD VALUE 'PROPOSED' BEFORE 'SUBMITTED';--> statement-breakpoint
ALTER TYPE "public"."milestone_status" ADD VALUE 'REJECTED';--> statement-breakpoint
CREATE TABLE "v4_committee_milestone_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"milestone_id" integer NOT NULL,
	"member_address" varchar(42) NOT NULL,
	"approve" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "v4_committee_milestone_votes_milestone_id_member_address_unique" UNIQUE("milestone_id","member_address")
);
--> statement-breakpoint
ALTER TABLE "v4_milestones" ADD COLUMN "kind" varchar(20) DEFAULT 'MANDATORY';--> statement-breakpoint
ALTER TABLE "v4_milestones" ADD COLUMN "proposed_by" varchar(42);--> statement-breakpoint
ALTER TABLE "v4_milestones" ADD COLUMN "approved_by" varchar(42);--> statement-breakpoint
ALTER TABLE "v4_programs" DROP COLUMN "max_optional_milestones";