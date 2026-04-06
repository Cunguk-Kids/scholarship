import { ponder } from "ponder:registry";
import { db } from "@/db";
import { v4CommitteeMembers, v4CommitteeDisputeVotes, v4CommitteeMilestoneVotes, v4Applicants } from "@/db/schema";
import { logger } from "@/utils/logger";
import { insertBlock } from "@/services/block.log.service";
import { sendSseToAll } from "@/api/controller/sse.controller";
import { eq, and } from "drizzle-orm";
import { findProgramUuid } from "./helpers";

export const committeeGovernanceHandlers = () => {

  // ── CommitteeMemberAdded — new member assigned to program committee ────

  ponder.on("CommitteeGovernance:CommitteeMemberAdded", async ({ event }) => {
    try {
      const { pid, member } = event.args;
      const progUuid = await findProgramUuid(Number(pid));

      await db.insert(v4CommitteeMembers).values({
        programId: progUuid ?? undefined,
        pid: Number(pid),
        memberAddress: String(member),
        isActive: true,
      }).onConflictDoUpdate({
        target: [v4CommitteeMembers.memberAddress, v4CommitteeMembers.pid],
        set: { isActive: true, removedAt: null, addedAt: new Date() },
      });

      await insertBlock({ event, eventName: "CommitteeGovernance:CommitteeMemberAdded" });
      await sendSseToAll("main", { step: "CommitteeMemberAdded", data: { pid, member }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "CommitteeMemberAdded handler error");
    }
  });

  // ── CommitteeMemberRemoved — member removed from program committee ────

  ponder.on("CommitteeGovernance:CommitteeMemberRemoved", async ({ event }) => {
    try {
      const { pid, member } = event.args;

      await db.update(v4CommitteeMembers)
        .set({ isActive: false, removedAt: new Date() })
        .where(and(
          eq(v4CommitteeMembers.pid, Number(pid)),
          eq(v4CommitteeMembers.memberAddress, String(member)),
        ));

      await insertBlock({ event, eventName: "CommitteeGovernance:CommitteeMemberRemoved" });
      await sendSseToAll("main", { step: "CommitteeMemberRemoved", data: { pid, member }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "CommitteeMemberRemoved handler error");
    }
  });

  // ── ScoreSubmitted — committee member submitted a score for an applicant ─

  ponder.on("CommitteeGovernance:ScoreSubmitted", async ({ event }) => {
    try {
      const { pid, applicant, score } = event.args;

      await db.update(v4Applicants)
        .set({
          screeningScore: String(score),
          updatedAt: new Date(),
        })
        .where(and(
          eq(v4Applicants.pid, Number(pid)),
          eq(v4Applicants.wallet, String(applicant)),
        ));

      await insertBlock({ event, eventName: "CommitteeGovernance:ScoreSubmitted" });
      await sendSseToAll("main", { step: "ScoreSubmitted", data: { pid, applicant, score: String(score) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ScoreSubmitted handler error");
    }
  });

  // ── DisputeVoteCast — individual committee member votes on dispute ─────

  ponder.on("CommitteeGovernance:DisputeVoteCast", async ({ event }) => {
    try {
      const { disputeId, member, upholdDispute } = event.args;

      await db.insert(v4CommitteeDisputeVotes).values({
        disputeId: Number(disputeId),
        memberAddress: String(member),
        upholdDispute: upholdDispute,
      }).onConflictDoUpdate({
        target: [v4CommitteeDisputeVotes.disputeId, v4CommitteeDisputeVotes.memberAddress],
        set: { upholdDispute: upholdDispute },
      });

      await insertBlock({ event, eventName: "CommitteeGovernance:DisputeVoteCast" });
      await sendSseToAll("main", { step: "DisputeVoteCast", data: { disputeId, member, upholdDispute }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "DisputeVoteCast handler error");
    }
  });

  // ── MilestoneVoteCast — committee member votes on optional milestone ───

  ponder.on("CommitteeGovernance:MilestoneVoteCast", async ({ event }) => {
    try {
      const { milestoneId, member, approve } = event.args;

      await db.insert(v4CommitteeMilestoneVotes).values({
        milestoneId: Number(milestoneId),
        memberAddress: String(member),
        approve: approve,
      }).onConflictDoUpdate({
        target: [v4CommitteeMilestoneVotes.milestoneId, v4CommitteeMilestoneVotes.memberAddress],
        set: { approve: approve },
      });

      await insertBlock({ event, eventName: "CommitteeGovernance:MilestoneVoteCast" });
      await sendSseToAll("main", { step: "MilestoneVoteCast", data: { milestoneId, member, approve }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "MilestoneVoteCast handler error");
    }
  });

  // ── MilestoneVoteResolved — committee majority reached on milestone ────

  ponder.on("CommitteeGovernance:MilestoneVoteResolved", async ({ event }) => {
    try {
      const { milestoneId, approved } = event.args;

      await insertBlock({ event, eventName: "CommitteeGovernance:MilestoneVoteResolved" });
      await sendSseToAll("main", { step: "MilestoneVoteResolved", data: { milestoneId, approved }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "MilestoneVoteResolved handler error");
    }
  });
};
