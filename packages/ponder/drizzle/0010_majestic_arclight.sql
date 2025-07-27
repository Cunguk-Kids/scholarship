ALTER TABLE "achievements" ALTER COLUMN "name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "file" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "indexed_blocks" ALTER COLUMN "event_name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "indexed_blocks" ALTER COLUMN "block_number" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "indexed_blocks" ALTER COLUMN "timestamp" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "is_collected" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "estimation" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "amount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "metadata_cid" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "prove_cid" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "name" SET DEFAULT 'Untitled Program';--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "metadata_cid" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "rules" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "total_recipients" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "total_fund" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "student_address" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "student_address" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "full_name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "email" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "financial_situation" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "scholarship_motivation" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "votes" ALTER COLUMN "address" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "votes" ALTER COLUMN "ip_address" SET DEFAULT '';