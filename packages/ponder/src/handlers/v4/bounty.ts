import { ponder } from "ponder:registry";
import { db } from "@/db";
import { v4Disputes, v4BountyHunters } from "@/db/schema";
import { logger } from "@/utils/logger";
import { insertBlock } from "@/services/block.log.service";
import { sendSseToAll } from "@/api/controller/sse.controller";
import { eq } from "drizzle-orm";
import { findProgramUuid, upsertBountyHunter } from "./helpers";

export const scholarshipBountyHandlers = () => {

  ponder.on("ScholarshipBounty:DisputeRaised", async ({ event }) => {
    try {
      const { disputeId, programId, scholar, bountyHunter, disputeType, evidenceCID, stake, potentialReward } = event.args;
      const progUuid = await findProgramUuid(Number(programId));

      const typeMap: Record<number, NonNullable<typeof v4Disputes.$inferInsert["disputeType"]>> = {
        0: "LIGHT_FRAUD", 1: "MILESTONE_FRAUD", 2: "HEAVY_FRAUD",
      };

      await db.insert(v4Disputes).values({
        blockchainId: Number(disputeId),
        programId: progUuid ?? undefined,
        scholarAddress: String(scholar),
        bountyHunter: String(bountyHunter),
        disputeType: typeMap[Number(disputeType)] ?? "LIGHT_FRAUD",
        status: "ACTIVE",
        evidenceCID: String(evidenceCID),
        stake: String(stake),
        potentialReward: String(potentialReward),
        raisedAt: new Date(Number(event.block.timestamp) * 1000),
      }).onConflictDoUpdate({
        target: [v4Disputes.blockchainId],
        set: { updatedAt: new Date() },
      });

      // Upsert BH profile
      await upsertBountyHunter(String(bountyHunter));

      await insertBlock({ event, eventName: "ScholarshipBounty:DisputeRaised" });
      await sendSseToAll("main", { step: "DisputeRaised", data: { disputeId, scholar, bountyHunter }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "DisputeRaised handler error");
    }
  });

  ponder.on("ScholarshipBounty:StudentDefended", async ({ event }) => {
    try {
      const { disputeId, counterEvidenceCID } = event.args;
      await db.update(v4Disputes)
        .set({ counterEvidenceCID: String(counterEvidenceCID), updatedAt: new Date() })
        .where(eq(v4Disputes.blockchainId, Number(disputeId)));

      await sendSseToAll("main", { step: "StudentDefended", data: { disputeId }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "StudentDefended handler error");
    }
  });

  ponder.on("ScholarshipBounty:StudentConceded", async ({ event }) => {
    try {
      const { disputeId } = event.args;
      await db.update(v4Disputes)
        .set({ status: "STUDENT_CONCEDED", resolvedAt: new Date(), updatedAt: new Date() })
        .where(eq(v4Disputes.blockchainId, Number(disputeId)));

      await sendSseToAll("main", { step: "StudentConceded", data: { disputeId }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "StudentConceded handler error");
    }
  });

  ponder.on("ScholarshipBounty:DisputeAutoGuilty", async ({ event }) => {
    try {
      const { disputeId } = event.args;
      await db.update(v4Disputes)
        .set({ status: "AUTO_GUILTY", resolvedAt: new Date(), updatedAt: new Date() })
        .where(eq(v4Disputes.blockchainId, Number(disputeId)));

      await sendSseToAll("main", { step: "DisputeAutoGuilty", data: { disputeId }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "DisputeAutoGuilty handler error");
    }
  });

  ponder.on("ScholarshipBounty:DisputeResolved", async ({ event }) => {
    try {
      const { disputeId, bountyHunterWon, bhReward } = event.args;
      await db.update(v4Disputes)
        .set({
          status: bountyHunterWon ? "BH_WON" : "BH_LOST",
          bhRewardPaid: String(bhReward),
          resolvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(v4Disputes.blockchainId, Number(disputeId)));

      // Update BH profile win/loss
      const [dispute] = await db.select({ bountyHunter: v4Disputes.bountyHunter })
        .from(v4Disputes).where(eq(v4Disputes.blockchainId, Number(disputeId))).limit(1);

      if (dispute) {
        const [bh] = await db.select().from(v4BountyHunters)
          .where(eq(v4BountyHunters.address, dispute.bountyHunter)).limit(1);

        if (bh) {
          await db.update(v4BountyHunters)
            .set({
              totalWins: bountyHunterWon ? (bh.totalWins ?? 0) + 1 : bh.totalWins,
              totalLosses: !bountyHunterWon ? (bh.totalLosses ?? 0) + 1 : bh.totalLosses,
              updatedAt: new Date(),
            })
            .where(eq(v4BountyHunters.address, dispute.bountyHunter));
        }
      }

      await sendSseToAll("main", { step: "DisputeResolved", data: { disputeId, bountyHunterWon }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "DisputeResolved handler error");
    }
  });

   ponder.on("ScholarshipBounty:GriefingStakeApplied", async ({ event }) => {
    try {
      const { disputeId, originalStake, appliedStake } = event.args;
      
      await db.update(v4Disputes)
        .set({ 
          isLateDispute: true, 
          griefingStakeOriginal: String(originalStake),
          stake: String(appliedStake),
          updatedAt: new Date() 
        })
        .where(eq(v4Disputes.blockchainId, Number(disputeId)));

      await insertBlock({ event, eventName: "ScholarshipBounty:GriefingStakeApplied" });
      await sendSseToAll("main", { step: "GriefingStakeApplied", data: { disputeId: Number(disputeId), appliedStake: String(appliedStake) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "GriefingStakeApplied handler error");
    }
  });

  ponder.on("ScholarshipBounty:BHFlagged", async ({ event }) => {
    try {
      const { bountyHunter, cooldownUntil } = event.args;
      const cooldownDate = new Date(Number(cooldownUntil) * 1000);

      const [existing] = await db.select().from(v4BountyHunters)
        .where(eq(v4BountyHunters.address, String(bountyHunter))).limit(1);

      if (existing) {
        await db.update(v4BountyHunters)
          .set({ isFlagged: true, cooldownUntil: cooldownDate, updatedAt: new Date() })
          .where(eq(v4BountyHunters.address, String(bountyHunter)));
      } else {
        await db.insert(v4BountyHunters).values({
          address: String(bountyHunter),
          isFlagged: true,
          cooldownUntil: cooldownDate,
        });
      }

      await insertBlock({ event, eventName: "ScholarshipBounty:BHFlagged" });
      await sendSseToAll("main", { step: "BHFlagged", data: { bountyHunter, cooldownUntil: cooldownDate.toISOString() }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "BHFlagged handler error");
    }
  });

  ponder.on("ScholarshipBounty:ForfeitedStakesWithdrawn", async ({ event }) => {
    try {
      const { recipient, amount } = event.args;
      await insertBlock({ event, eventName: "ScholarshipBounty:ForfeitedStakesWithdrawn" });
      await sendSseToAll("main", { step: "ForfeitedStakesWithdrawn", data: { recipient, amount: String(amount) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ForfeitedStakesWithdrawn handler error");
    }
  });
};
