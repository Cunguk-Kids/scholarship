ALTER TABLE "votes" ADD COLUMN "blockchain_program_id" integer;--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN "blockchain_student_id" integer;--> statement-breakpoint
ALTER TABLE "votes" DROP COLUMN "blockchain_id";