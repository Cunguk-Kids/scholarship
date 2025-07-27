CREATE TYPE "public"."milestone_allocation_type" AS ENUM('FIXED', 'USER_DEFINED');--> statement-breakpoint
CREATE TYPE "public"."milestone_type" AS ENUM('Tuition', 'Equipment', 'Living_Cost', 'Project', 'Others');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar(50),
	"name" varchar(255),
	"file" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar(50),
	"type" "milestone_type",
	"description" text,
	"estimation" numeric,
	"amount" numeric
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" serial NOT NULL,
	"name" varchar(255),
	"description" text,
	"start_at" timestamp,
	"end_at" timestamp,
	"voting_at" timestamp,
	"rules" text,
	"total_recipients" varchar(255),
	"total_fund" numeric,
	"milestone_type_enum" "milestone_allocation_type",
	CONSTRAINT "programs_program_id_unique" UNIQUE("program_id")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar,
	"full_name" varchar(255),
	"email" varchar(255),
	"financial_situation" text,
	"scholarship_motivation" text,
	"program_id" integer,
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(255),
	"program_id" integer,
	"student_id" varchar(50),
	"ip_address" varchar(45)
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_program_id_programs_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("program_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_program_id_programs_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("program_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE no action ON UPDATE no action;