ALTER TABLE "programs" ALTER COLUMN "start_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "start_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "end_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "end_at" SET DEFAULT now();