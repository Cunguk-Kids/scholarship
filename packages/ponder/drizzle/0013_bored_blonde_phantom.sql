ALTER TABLE "programs" ALTER COLUMN "start_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "start_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "end_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "end_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "voting_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "voting_at" SET DEFAULT now();