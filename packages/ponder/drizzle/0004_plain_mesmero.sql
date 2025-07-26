ALTER TABLE "achievements" ALTER COLUMN "student_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "student_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "student_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "student_address" varchar;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_student_address_unique" UNIQUE("student_address");