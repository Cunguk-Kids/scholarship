ALTER TABLE "applicants" ADD COLUMN "applicant_address" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "milestone" ADD COLUMN "title" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "milestone" ADD COLUMN "prove_metadata" varchar;--> statement-breakpoint
ALTER TABLE "milestone" ADD COLUMN "prove_review" varchar;