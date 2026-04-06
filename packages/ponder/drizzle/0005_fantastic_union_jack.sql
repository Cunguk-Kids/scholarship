ALTER TABLE "v4_applicants" RENAME COLUMN "blockchain_program_id" TO "pid";--> statement-breakpoint
ALTER TABLE "v4_committee_members" RENAME COLUMN "blockchain_program_id" TO "pid";--> statement-breakpoint
ALTER TABLE "v4_confidence_stakes" RENAME COLUMN "blockchain_program_id" TO "pid";--> statement-breakpoint
ALTER TABLE "v4_donations" RENAME COLUMN "blockchain_program_id" TO "pid";--> statement-breakpoint
ALTER TABLE "v4_programs" RENAME COLUMN "blockchain_id" TO "pid";--> statement-breakpoint
ALTER TABLE "v4_scholars" RENAME COLUMN "blockchain_program_id" TO "pid";--> statement-breakpoint
ALTER TABLE "v4_votes" RENAME COLUMN "blockchain_program_id" TO "pid";--> statement-breakpoint
ALTER TABLE "v4_applicants" DROP CONSTRAINT "v4_applicants_wallet_blockchain_program_id_unique";--> statement-breakpoint
ALTER TABLE "v4_committee_members" DROP CONSTRAINT "v4_committee_members_member_address_blockchain_program_id_unique";--> statement-breakpoint
ALTER TABLE "v4_confidence_stakes" DROP CONSTRAINT "v4_confidence_stakes_voter_address_blockchain_program_id_unique";--> statement-breakpoint
ALTER TABLE "v4_programs" DROP CONSTRAINT "v4_programs_blockchain_id_unique";--> statement-breakpoint
ALTER TABLE "v4_scholars" DROP CONSTRAINT "v4_scholars_wallet_blockchain_program_id_unique";--> statement-breakpoint
ALTER TABLE "v4_votes" DROP CONSTRAINT "v4_votes_voter_address_blockchain_program_id_unique";--> statement-breakpoint
ALTER TABLE "v4_programs" ADD COLUMN "resolve_progress" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "v4_reputation" ADD COLUMN "remaining_voting_power" numeric DEFAULT '0';--> statement-breakpoint
ALTER TABLE "v4_applicants" ADD CONSTRAINT "v4_applicants_wallet_pid_unique" UNIQUE("wallet","pid");--> statement-breakpoint
ALTER TABLE "v4_committee_members" ADD CONSTRAINT "v4_committee_members_member_address_pid_unique" UNIQUE("member_address","pid");--> statement-breakpoint
ALTER TABLE "v4_confidence_stakes" ADD CONSTRAINT "v4_confidence_stakes_voter_address_pid_unique" UNIQUE("voter_address","pid");--> statement-breakpoint
ALTER TABLE "v4_programs" ADD CONSTRAINT "v4_programs_pid_unique" UNIQUE("pid");--> statement-breakpoint
ALTER TABLE "v4_scholars" ADD CONSTRAINT "v4_scholars_wallet_pid_unique" UNIQUE("wallet","pid");--> statement-breakpoint
ALTER TABLE "v4_votes" ADD CONSTRAINT "v4_votes_voter_address_pid_unique" UNIQUE("voter_address","pid");