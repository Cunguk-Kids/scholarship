ALTER TABLE "programs" ALTER COLUMN "voting_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "voting_at" SET DEFAULT now();