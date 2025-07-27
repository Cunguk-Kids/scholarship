ALTER TABLE "milestones" ADD COLUMN "program_id" integer;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "metadata_cid" varchar(255);--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "prove_cid" varchar(255);--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "metadata_cid" varchar(255);--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_program_id_programs_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("program_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN "metadataCID";