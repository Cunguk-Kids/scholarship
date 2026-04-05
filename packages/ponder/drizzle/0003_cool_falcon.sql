ALTER TABLE "v4_milestones" ADD COLUMN "requires_proof" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "v4_programs" ADD COLUMN "protocol_fee_collected" numeric DEFAULT '0';