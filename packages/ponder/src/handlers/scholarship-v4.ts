import { ponder } from "ponder:registry";
import { db } from "@/db";
import { and, eq, sql } from "drizzle-orm";
import {
  v4Programs, v4Applicants, v4Scholars,
  v4Milestones, v4Votes, v4ConfidenceStakes,
  v4Disputes, v4Reputation,
} from "@/db/schema";
import { fetchFromIPFS, isValidCID } from "../utils/ipfs";
import { logger } from "@/utils/logger";
import { insertBlock } from "@/services/block.log.service";
import { sendSseToAll } from "@/api/controller/sse.controller";

// ── Helpers ────────────────────────────────────────────────────────────

/** Upsert v4_reputation balance for an address */
async function upsertReputation(
  address: string,
  delta: bigint,
  isMint: boolean,
) {
  const existing = await db.select().from(v4Reputation)
    .where(eq(v4Reputation.address, address))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(v4Reputation).values({
      address,
      repBalance:  String(isMint ? delta : 0n),
      totalMinted: String(isMint ? delta : 0n),
      totalBurned: String(isMint ? 0n : delta),
    });
  } else {
    const row = existing[0]!;
    const prev = BigInt(row.repBalance ?? "0");
    await db.update(v4Reputation)
      .set({
        repBalance:  String(isMint ? prev + delta : (prev > delta ? prev - delta : 0n)),
        totalMinted: String(BigInt(row.totalMinted ?? "0") + (isMint ? delta : 0n)),
        totalBurned: String(BigInt(row.totalBurned ?? "0") + (isMint ? 0n : delta)),
        updatedAt:   new Date(),
      })
      .where(eq(v4Reputation.address, address));
  }
}

/** Find or insert a v4Program row, returning its UUID */
async function findProgramUuid(blockchainId: number): Promise<string | null> {
  const rows = await db.select().from(v4Programs)
    .where(eq(v4Programs.blockchainId, blockchainId)).limit(1);
  return rows[0]?.id ?? null;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCHOLARSHIP CORE HANDLERS
// ══════════════════════════════════════════════════════════════════════════════

export const scholarshipCoreHandlers = () => {

  // ── Phase 0: Program Created ─────────────────────────────────────────────

  ponder.on("ScholarshipCore:ProgramCreated", async ({ event }) => {
    try {
      const { programId, initiator, metadataCID } = event.args;
      logger.info({ programId, initiator, metadataCID }, "ProgramCreated");

      await db.insert(v4Programs).values({
        blockchainId: Number(programId),
        initiator:    String(initiator),
        metadataCID:  String(metadataCID),
        status:       "CREATED",
      }).onConflictDoUpdate({
        target: [v4Programs.blockchainId],
        set: { metadataCID: String(metadataCID), updatedAt: new Date() },
      });

      await insertBlock({ event, eventName: "ScholarshipCore:ProgramCreated" });
      await sendSseToAll("main", { step: "ProgramCreated", data: { programId, initiator }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ProgramCreated handler error");
    }
  });

  // ── Program Status Changed ─────────────────────────────────────────────

  ponder.on("ScholarshipCore:ProgramStatusChanged", async ({ event }) => {
    try {
      const { programId, newStatus } = event.args;
      // newStatus is a uint8 — map to enum string
      const statusMap: Record<number, typeof v4Programs.$inferInsert["status"]> = {
        0: "CREATED", 1: "APPLICATION_OPEN", 2: "SCREENING",
        3: "VOTING",  4: "ACTIVE",           5: "COMPLETED", 6: "CANCELLED",
      };
      const status = statusMap[Number(newStatus)] ?? "CREATED";

      await db.update(v4Programs)
        .set({ status, updatedAt: new Date() })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await insertBlock({ event, eventName: "ScholarshipCore:ProgramStatusChanged" });
      await sendSseToAll("main", { step: "ProgramStatusChanged", data: { programId, status }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ProgramStatusChanged handler error");
    }
  });

  // ── Phase 1: Donation ─────────────────────────────────────────────────

  ponder.on("ScholarshipCore:DonationReceived", async ({ event }) => {
    try {
      const { programId, donor, grossAmount, netAmount } = event.args;
      logger.info({ programId, donor }, "DonationReceived");

      await db.update(v4Programs)
        .set({ updatedAt: new Date() })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await insertBlock({ event, eventName: "ScholarshipCore:DonationReceived" });
      await sendSseToAll("main", { step: "DonationReceived", data: { programId, donor, grossAmount, netAmount }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "DonationReceived handler error");
    }
  });

  // ── Phase 2: Application ──────────────────────────────────────────────

  ponder.on("ScholarshipCore:StudentApplied", async ({ event }) => {
    try {
      const { programId, student, retryCount } = event.args;
      const progUuid = await findProgramUuid(Number(programId));

      await db.insert(v4Applicants).values({
        programId:           progUuid ?? undefined,
        blockchainProgramId: Number(programId),
        wallet:              String(student),
        retryCount:          Number(retryCount),
      }).onConflictDoUpdate({
        target: [v4Applicants.wallet, v4Applicants.blockchainProgramId],
        set: { retryCount: Number(retryCount), updatedAt: new Date() },
      });

      await insertBlock({ event, eventName: "ScholarshipCore:StudentApplied" });
    } catch (err) {
      logger.error({ err }, "StudentApplied handler error");
    }
  });

  ponder.on("ScholarshipCore:ScoreSubmitted", async ({ event }) => {
    try {
      const { programId, student, totalScore } = event.args;
      await db.update(v4Applicants)
        .set({ screeningScore: String(totalScore), totalScore: String(totalScore), updatedAt: new Date() })
        .where(and(
          eq(v4Applicants.blockchainProgramId, Number(programId)),
          eq(v4Applicants.wallet, String(student)),
        ));

      await insertBlock({ event, eventName: "ScholarshipCore:ScoreSubmitted" });
    } catch (err) {
      logger.error({ err }, "ScoreSubmitted handler error");
    }
  });

  ponder.on("ScholarshipCore:StudentShortlisted", async ({ event }) => {
    try {
      const { programId, student, score } = event.args;
      await db.update(v4Applicants)
        .set({ status: "SHORTLISTED", screeningScore: String(score), updatedAt: new Date() })
        .where(eq(v4Applicants.wallet, String(student)));

      await db.update(v4Programs)
        .set({
          shortlistedCount: sql`(SELECT COUNT(*) FROM v4_applicants WHERE blockchain_program_id = ${Number(programId)} AND status = 'SHORTLISTED')`,
          updatedAt: new Date(),
        })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await sendSseToAll("main", { step: "StudentShortlisted", data: { programId, student }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "StudentShortlisted handler error");
    }
  });

  // ── Phase 3: Voting ───────────────────────────────────────────────────

  ponder.on("ScholarshipCore:VoteCast", async ({ event }) => {
    try {
      const { programId, voter, candidate, weight } = event.args;
      const progUuid = await findProgramUuid(Number(programId));

      await db.insert(v4Votes).values({
        programId:           progUuid ?? undefined,
        blockchainProgramId: Number(programId),
        voterAddress:        String(voter),
        candidateAddress:    String(candidate),
        votingWeight:        String(weight),
      }).onConflictDoUpdate({
        target: [v4Votes.voterAddress, v4Votes.blockchainProgramId],
        set: { candidateAddress: String(candidate), votingWeight: String(weight) },
      });

      await insertBlock({ event, eventName: "ScholarshipCore:VoteCast" });
      await sendSseToAll("main", { step: "VoteCast", data: { programId, voter, candidate }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "VoteCast handler error");
    }
  });

  ponder.on("ScholarshipCore:ConfidenceStaked", async ({ event }) => {
    try {
      const { programId, voter, scholar, amount } = event.args;
      const progUuid = await findProgramUuid(Number(programId));

      await db.insert(v4ConfidenceStakes).values({
        programId:           progUuid ?? undefined,
        blockchainProgramId: Number(programId),
        voterAddress:        String(voter),
        scholarAddress:      String(scholar),
        amount:              String(amount),
      }).onConflictDoUpdate({
        target: [v4ConfidenceStakes.voterAddress, v4ConfidenceStakes.blockchainProgramId],
        set: { amount: String(amount), updatedAt: new Date() },
      });

      await insertBlock({ event, eventName: "ScholarshipCore:ConfidenceStaked" });
    } catch (err) {
      logger.error({ err }, "ConfidenceStaked handler error");
    }
  });

  // ── Phase 4: Scholar Selected ─────────────────────────────────────────

  ponder.on("ScholarshipCore:ScholarSelected", async ({ event }) => {
    try {
      const { programId, scholar } = event.args;
      const progUuid = await findProgramUuid(Number(programId));

      await db.insert(v4Scholars).values({
        programId:           progUuid ?? undefined,
        blockchainProgramId: Number(programId),
        wallet:              String(scholar),
        status:              "ACTIVE",
      }).onConflictDoUpdate({
        target: [v4Scholars.wallet, v4Scholars.blockchainProgramId],
        set: { status: "ACTIVE", updatedAt: new Date() },
      });

      await insertBlock({ event, eventName: "ScholarshipCore:ScholarSelected" });
      await sendSseToAll("main", { step: "ScholarSelected", data: { programId, scholar }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ScholarSelected handler error");
    }
  });

  // ── Milestones ────────────────────────────────────────────────────────

  ponder.on("ScholarshipCore:MilestoneSubmitted", async ({ event }) => {
    try {
      const { milestoneId, scholar, proofCID } = event.args;
      const mId = Number(milestoneId);

      await db.insert(v4Milestones).values({
        blockchainId:  mId,
        scholarWallet: String(scholar),
        proofCID:      String(proofCID),
        status:        "SUBMITTED",
        submittedAt:   new Date(Number(event.block.timestamp) * 1000),
      }).onConflictDoUpdate({
        target: [v4Milestones.blockchainId],
        set: { proofCID: String(proofCID), status: "SUBMITTED", submittedAt: new Date(), updatedAt: new Date() },
      });

      await insertBlock({ event, eventName: "ScholarshipCore:MilestoneSubmitted" });
      await sendSseToAll("main", { step: "MilestoneSubmitted", data: { milestoneId, scholar }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "MilestoneSubmitted handler error");
    }
  });

  ponder.on("ScholarshipCore:MilestoneCompleted", async ({ event }) => {
    try {
      const { milestoneId, scholar, amount } = event.args;
      await db.update(v4Milestones)
        .set({ status: "COMPLETED", completedAt: new Date(), updatedAt: new Date() })
        .where(eq(v4Milestones.blockchainId, Number(milestoneId)));

      // Update scholar totalReceived — find the milestone's programId first to scope the update
      const [milestone] = await db.select({ scholarId: v4Milestones.scholarId, programId: v4Milestones.programId })
        .from(v4Milestones)
        .where(eq(v4Milestones.blockchainId, Number(milestoneId)))
        .limit(1);

      if (milestone?.scholarId) {
        const [existingScholar] = await db.select({ id: v4Scholars.id, totalReceived: v4Scholars.totalReceived })
          .from(v4Scholars)
          .where(eq(v4Scholars.id, milestone.scholarId))
          .limit(1);

        if (existingScholar) {
          const prev = BigInt(existingScholar.totalReceived ?? "0");
          await db.update(v4Scholars)
            .set({ totalReceived: String(prev + BigInt(amount)), updatedAt: new Date() })
            .where(eq(v4Scholars.id, milestone.scholarId));
        }
      }

      await insertBlock({ event, eventName: "ScholarshipCore:MilestoneCompleted" });
      await sendSseToAll("main", { step: "MilestoneCompleted", data: { milestoneId, scholar, amount }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "MilestoneCompleted handler error");
    }
  });

  ponder.on("ScholarshipCore:MilestoneFrozen", async ({ event }) => {
    try {
      const { milestoneId } = event.args;
      await db.update(v4Milestones)
        .set({ status: "FROZEN", updatedAt: new Date() })
        .where(eq(v4Milestones.blockchainId, Number(milestoneId)));
      await insertBlock({ event, eventName: "ScholarshipCore:MilestoneFrozen" });
    } catch (err) {
      logger.error({ err }, "MilestoneFrozen handler error");
    }
  });

  ponder.on("ScholarshipCore:MilestoneReleased", async ({ event }) => {
    try {
      const { milestoneId } = event.args;
      await db.update(v4Milestones)
        .set({ status: "SUBMITTED", updatedAt: new Date() })
        .where(eq(v4Milestones.blockchainId, Number(milestoneId)));
      await insertBlock({ event, eventName: "ScholarshipCore:MilestoneReleased" });
    } catch (err) {
      logger.error({ err }, "MilestoneReleased handler error");
    }
  });

  // ── Slash / Complete ──────────────────────────────────────────────────

  ponder.on("ScholarshipCore:ScholarSlashed", async ({ event }) => {
    try {
      const { scholar, programId, dtype } = event.args;
      const statusMap: Record<number, typeof v4Scholars.$inferInsert["status"]> = {
        0: "FROZEN", 1: "FROZEN", 2: "BLACKLISTED",
      };
      const status = statusMap[Number(dtype)] ?? "FROZEN";

      await db.update(v4Scholars)
        .set({
          status,
          isBlacklisted: Number(dtype) === 2,
          updatedAt: new Date(),
        })
        .where(and(
          eq(v4Scholars.wallet, String(scholar)),
          eq(v4Scholars.blockchainProgramId, Number(programId)),
        ));

      await insertBlock({ event, eventName: "ScholarshipCore:ScholarSlashed" });
      await sendSseToAll("main", { step: "ScholarSlashed", data: { scholar, programId }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ScholarSlashed handler error");
    }
  });

  ponder.on("ScholarshipCore:ScholarCompleted", async ({ event }) => {
    try {
      const { programId, scholar } = event.args;
      await db.update(v4Scholars)
        .set({ status: "COMPLETED", updatedAt: new Date() })
        .where(eq(v4Scholars.wallet, String(scholar)));

      await sendSseToAll("main", { step: "ScholarCompleted", data: { programId, scholar }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ScholarCompleted handler error");
    }
  });

  ponder.on("ScholarshipCore:ProgramCompleted", async ({ event }) => {
    try {
      const { programId } = event.args;
      await db.update(v4Programs)
        .set({ status: "COMPLETED", updatedAt: new Date() })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await sendSseToAll("main", { step: "ProgramCompleted", data: { programId }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ProgramCompleted handler error");
    }
  });

  ponder.on("ScholarshipCore:ProgramCancelled", async ({ event }) => {
    try {
      const { programId } = event.args;
      await db.update(v4Programs)
        .set({ status: "CANCELLED", updatedAt: new Date() })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await sendSseToAll("main", { step: "ProgramCancelled", data: { programId }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ProgramCancelled handler error");
    }
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// TREASURY HANDLERS
// ══════════════════════════════════════════════════════════════════════════════

export const scholarshipTreasuryHandlers = () => {

  ponder.on("ScholarshipTreasury:ConfidenceStakeResolved", async ({ event }) => {
    try {
      const { programId, voter, returned, bonus, slashed } = event.args;
      await db.update(v4ConfidenceStakes)
        .set({
          isResolved:     true,
          wasSlashed:     slashed,
          returnedAmount: String(returned),
          bonusAmount:    String(bonus),
          updatedAt:      new Date(),
        })
        .where(eq(v4ConfidenceStakes.voterAddress, String(voter)));

      await sendSseToAll("main", { step: "ConfidenceStakeResolved", data: { programId, voter, slashed }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ConfidenceStakeResolved handler error");
    }
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// BOUNTY HANDLERS
// ══════════════════════════════════════════════════════════════════════════════

export const scholarshipBountyHandlers = () => {

  ponder.on("ScholarshipBounty:DisputeRaised", async ({ event }) => {
    try {
      const { disputeId, programId, scholar, bountyHunter, disputeType, evidenceCID, stake, potentialReward } = event.args;
      const progUuid = await findProgramUuid(Number(programId));

      const typeMap: Record<number, typeof v4Disputes.$inferInsert["disputeType"]> = {
        0: "LIGHT_FRAUD", 1: "MILESTONE_FRAUD", 2: "HEAVY_FRAUD",
      };

      await db.insert(v4Disputes).values({
        blockchainId:    Number(disputeId),
        programId:       progUuid ?? undefined,
        scholarAddress:  String(scholar),
        bountyHunter:    String(bountyHunter),
        disputeType:     typeMap[Number(disputeType)] ?? "LIGHT_FRAUD",
        status:          "ACTIVE",
        evidenceCID:     String(evidenceCID),
        stake:           String(stake),
        potentialReward: String(potentialReward),
        raisedAt:        new Date(Number(event.block.timestamp) * 1000),
      }).onConflictDoUpdate({
        target: [v4Disputes.blockchainId],
        set: { updatedAt: new Date() },
      });

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
          status:      bountyHunterWon ? "BH_WON" : "BH_LOST",
          bhRewardPaid: String(bhReward),
          resolvedAt:  new Date(),
          updatedAt:   new Date(),
        })
        .where(eq(v4Disputes.blockchainId, Number(disputeId)));

      await sendSseToAll("main", { step: "DisputeResolved", data: { disputeId, bountyHunterWon }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "DisputeResolved handler error");
    }
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// REPUTATION HANDLERS
// ══════════════════════════════════════════════════════════════════════════════

export const scholarshipReputationHandlers = () => {

  ponder.on("ScholarshipReputation:ReputationMinted", async ({ event }) => {
    try {
      const { to, amount } = event.args;
      await upsertReputation(String(to), BigInt(amount), true);
      await insertBlock({ event, eventName: "ScholarshipReputation:ReputationMinted" });
    } catch (err) {
      logger.error({ err }, "ReputationMinted handler error");
    }
  });

  ponder.on("ScholarshipReputation:ReputationBurned", async ({ event }) => {
    try {
      const { from, amount } = event.args;
      await upsertReputation(String(from), BigInt(amount), false);
      await insertBlock({ event, eventName: "ScholarshipReputation:ReputationBurned" });
    } catch (err) {
      logger.error({ err }, "ReputationBurned handler error");
    }
  });

  ponder.on("ScholarshipReputation:VotingPowerLocked", async ({ event }) => {
    try {
      const { voter, lockedUntil } = event.args;
      const lockDate = new Date(Number(lockedUntil) * 1000);

      const existing = await db.select().from(v4Reputation).where(eq(v4Reputation.address, String(voter))).limit(1);
      if (existing.length === 0) {
        await db.insert(v4Reputation).values({ address: String(voter), votingLockedUntil: lockDate });
      } else {
        await db.update(v4Reputation)
          .set({ votingLockedUntil: lockDate, updatedAt: new Date() })
          .where(eq(v4Reputation.address, String(voter)));
      }
    } catch (err) {
      logger.error({ err }, "VotingPowerLocked handler error");
    }
  });
};
