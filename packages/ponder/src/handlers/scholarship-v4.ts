import { ponder } from "ponder:registry";
import { db } from "@/db";
import { and, eq, sql } from "drizzle-orm";
import {
  v4Programs, v4Applicants, v4Scholars,
  v4Milestones, v4Votes, v4ConfidenceStakes,
  v4Disputes, v4Reputation, v4Donations,
  v4CommitteeMembers, v4CommitteeDisputeVotes,
  v4BountyHunters, v4CommitteeMilestoneVotes
} from "@/db/schema";
import { logger } from "@/utils/logger";
import { insertBlock } from "@/services/block.log.service";
import { sendSseToAll } from "@/api/controller/sse.controller";
import { scholarshipCoreAbi } from "abis/v4/ScholarshipCore";

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
      repBalance: String(isMint ? delta : 0n),
      totalMinted: String(isMint ? delta : 0n),
      totalBurned: String(isMint ? 0n : delta),
    });
  } else {
    const row = existing[0]!;
    const prev = BigInt(row.repBalance ?? "0");
    await db.update(v4Reputation)
      .set({
        repBalance: String(isMint ? prev + delta : (prev > delta ? prev - delta : 0n)),
        totalMinted: String(BigInt(row.totalMinted ?? "0") + (isMint ? delta : 0n)),
        totalBurned: String(BigInt(row.totalBurned ?? "0") + (isMint ? 0n : delta)),
        updatedAt: new Date(),
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

/** Upsert bounty hunter profile */
async function upsertBountyHunter(address: string) {
  const [existing] = await db.select().from(v4BountyHunters)
    .where(eq(v4BountyHunters.address, address)).limit(1);

  if (!existing) {
    await db.insert(v4BountyHunters).values({ address, totalDisputes: 1 });
  } else {
    await db.update(v4BountyHunters)
      .set({ totalDisputes: (existing.totalDisputes ?? 0) + 1, updatedAt: new Date() })
      .where(eq(v4BountyHunters.address, address));
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SCHOLARSHIP CORE HANDLERS
// ══════════════════════════════════════════════════════════════════════════════

export const scholarshipCoreHandlers = () => {

  // ── Phase 0: Program Created ─────────────────────────────────────────────

  ponder.on("ScholarshipCore:ProgramCreated", async ({ event, context }) => {
    try {
      const { programId, initiator, metadataCID } = event.args;

      const prog: any = await context.client.readContract({
        abi: scholarshipCoreAbi,
        address: event.log.address as `0x${string}`,
        functionName: "getProgram",
        args: [programId],
      });

      const toDate = (ts: bigint) => ts > 0n ? new Date(Number(ts) * 1000) : null;

      await db.insert(v4Programs).values({
        blockchainId: Number(programId),
        initiator: String(initiator),
        metadataCID: String(metadataCID),
        status: "CREATED",
        totalFund: String(prog.totalFund),
        targetWinners: Number(prog.targetWinners),
        maxCandidates: Number(prog.maxCandidates),
        educationLevel: Number(prog.educationLevel),
        screeningMode: Number(prog.screeningMode),
        applicationStart: toDate(prog.applicationStart),
        applicationEnd: toDate(prog.applicationEnd),
        votingStart: toDate(prog.votingStart),
        votingEnd: toDate(prog.votingEnd),
        openDonation: Boolean(prog.openDonation),
      }).onConflictDoUpdate({
        target: [v4Programs.blockchainId],
        set: {
          metadataCID: String(metadataCID),
          totalFund: String(prog.totalFund),
          targetWinners: Number(prog.targetWinners),
          maxCandidates: Number(prog.maxCandidates),
          educationLevel: Number(prog.educationLevel),
          screeningMode: Number(prog.screeningMode),
          applicationStart: toDate(prog.applicationStart),
          applicationEnd: toDate(prog.applicationEnd),
          votingStart: toDate(prog.votingStart),
          votingEnd: toDate(prog.votingEnd),
          openDonation: Boolean(prog.openDonation),
          updatedAt: new Date(),
        },
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
      const statusMap: Record<number, NonNullable<typeof v4Programs.$inferInsert["status"]>> = {
        0: "CREATED", 1: "APPLICATION_OPEN", 2: "SCREENING",
        3: "VOTING", 4: "ACTIVE", 5: "COMPLETED", 6: "CANCELLED",
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

  ponder.on("ScholarshipCore:OpenDonationToggled", async ({ event }) => {
    try {
      const { programId, open } = event.args;
      await db.update(v4Programs)
        .set({ openDonation: open, updatedAt: new Date() })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await sendSseToAll("main", { step: "OpenDonationToggled", data: { programId, open }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "OpenDonationToggled handler error");
    }
  });

  // ── Committee Assigned ─────────────────────────────────────────────────

  // scholarship-v4.ts — CommitteeAssigned handler
  ponder.on("ScholarshipCore:CommitteeAssigned", async ({ event }) => {
    try {
      const { programId, committeeContract } = event.args;
      await db.insert(v4Programs)
        .values({
          blockchainId: Number(programId),
          initiator: "",
          committeeContract: String(committeeContract),
        })
        .onConflictDoUpdate({
          target: [v4Programs.blockchainId],
          set: { committeeContract: String(committeeContract), updatedAt: new Date() },
        });
    } catch (err) {
      logger.error({ err }, "CommitteeAssigned handler error");
    }
  });

  // ── Phase 1: Donation ─────────────────────────────────────────────────

  ponder.on("ScholarshipCore:DonationReceived", async ({ event }) => {
    try {
      const { programId, donor, grossAmount, netAmount } = event.args;
      logger.info({ programId, donor }, "DonationReceived");

      // Update program totalFund with the net amount
      const [prog] = await db.select({ totalFund: v4Programs.totalFund })
        .from(v4Programs)
        .where(eq(v4Programs.blockchainId, Number(programId)))
        .limit(1);

      if (prog) {
        const prevFund = BigInt(prog.totalFund ?? "0");
        await db.update(v4Programs)
          .set({ totalFund: String(prevFund + BigInt(netAmount)), updatedAt: new Date() })
          .where(eq(v4Programs.blockchainId, Number(programId)));
      }

      await insertBlock({ event, eventName: "ScholarshipCore:DonationReceived" });
      await sendSseToAll("main", { step: "DonationReceived", data: { programId, donor, grossAmount: String(grossAmount), netAmount: String(netAmount) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "DonationReceived handler error");
    }
  });

  ponder.on("ScholarshipCore:ProtocolFeeCollected", async ({ event }) => {
    try {
      const { programId, donor, feeAmount } = event.args;
      logger.info({ programId, donor, feeAmount: feeAmount.toString() }, "ProtocolFeeCollected");

      const [prog] = await db.select({ protocolFeeCollected: v4Programs.protocolFeeCollected })
        .from(v4Programs)
        .where(eq(v4Programs.blockchainId, Number(programId)))
        .limit(1);

      if (prog) {
        const prevFee = BigInt(prog.protocolFeeCollected ?? "0");
        await db.update(v4Programs)
          .set({ protocolFeeCollected: String(prevFee + BigInt(feeAmount)), updatedAt: new Date() })
          .where(eq(v4Programs.blockchainId, Number(programId)));
      }

      await insertBlock({ event, eventName: "ScholarshipCore:ProtocolFeeCollected" });
      await sendSseToAll("main", { step: "ProtocolFeeCollected", data: { programId, donor, feeAmount: String(feeAmount) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ProtocolFeeCollected handler error");
    }
  });

  // ── Phase 2: Application ──────────────────────────────────────────────

  ponder.on("ScholarshipCore:StudentApplied", async ({ event }) => {
    try {
      const { programId, student, retryCount } = event.args;
      const progUuid = await findProgramUuid(Number(programId));

      await db.insert(v4Applicants).values({
        programId: progUuid ?? undefined,
        blockchainProgramId: Number(programId),
        wallet: String(student),
        retryCount: Number(retryCount),
      }).onConflictDoUpdate({
        target: [v4Applicants.wallet, v4Applicants.blockchainProgramId],
        set: { retryCount: Number(retryCount), updatedAt: new Date() },
      });

      // Increment applicant count
      await db.update(v4Programs)
        .set({
          applicantCount: sql`(SELECT COUNT(*) FROM v4_applicants WHERE blockchain_program_id = ${Number(programId)})`,
          updatedAt: new Date(),
        })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await insertBlock({ event, eventName: "ScholarshipCore:StudentApplied" });
      await sendSseToAll("main", { step: "StudentApplied", data: { programId, student }, status: true, blockHash: event.block.hash });
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

  ponder.on("ScholarshipCore:StudentScreenedOut", async ({ event }) => {
    try {
      const { programId, student, score, locked } = event.args;
      await db.update(v4Applicants)
        .set({
          status: locked ? "LOCKED" : "SCREENED_OUT",
          screeningScore: String(score),
          updatedAt: new Date(),
        })
        .where(and(
          eq(v4Applicants.blockchainProgramId, Number(programId)),
          eq(v4Applicants.wallet, String(student)),
        ));

      await insertBlock({ event, eventName: "ScholarshipCore:StudentScreenedOut" });
    } catch (err) {
      logger.error({ err }, "StudentScreenedOut handler error");
    }
  });

  ponder.on("ScholarshipCore:StudentShortlisted", async ({ event }) => {
    try {
      const { programId, student, score } = event.args;
      await db.update(v4Applicants)
        .set({ status: "SHORTLISTED", screeningScore: String(score), updatedAt: new Date() })
        .where(and(
          eq(v4Applicants.blockchainProgramId, Number(programId)),
          eq(v4Applicants.wallet, String(student)),
        ));

      await db.update(v4Programs)
        .set({
          shortlistedCount: sql`(SELECT COUNT(*) FROM v4_applicants WHERE blockchain_program_id = ${Number(programId)} AND status = 'SHORTLISTED')`,
          updatedAt: new Date(),
        })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await insertBlock({ event, eventName: "ScholarshipCore:StudentShortlisted" });
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
        programId: progUuid ?? undefined,
        blockchainProgramId: Number(programId),
        voterAddress: String(voter),
        candidateAddress: String(candidate),
        votingWeight: String(weight),
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
        programId: progUuid ?? undefined,
        blockchainProgramId: Number(programId),
        voterAddress: String(voter),
        scholarAddress: String(scholar),
        amount: String(amount),
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
        programId: progUuid ?? undefined,
        blockchainProgramId: Number(programId),
        wallet: String(scholar),
        status: "ACTIVE",
      }).onConflictDoUpdate({
        target: [v4Scholars.wallet, v4Scholars.blockchainProgramId],
        set: { status: "ACTIVE", updatedAt: new Date() },
      });

      const progSync: any = await context.client.readContract({
        abi: scholarshipCoreAbi,
        address: event.log.address as `0x${string}`,
        functionName: "getProgram",
        args: [programId],
      });

      // Update active scholar count and allocated fund from contract
      await db.update(v4Programs)
        .set({
          activeScholarCount: sql`(SELECT COUNT(*) FROM v4_scholars WHERE blockchain_program_id = ${Number(programId)} AND status = 'ACTIVE')`,
          allocatedFund: String(progSync.allocatedFund),
          updatedAt: new Date(),
        })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await insertBlock({ event, eventName: "ScholarshipCore:ScholarSelected" });
      await sendSseToAll("main", { step: "ScholarSelected", data: { programId, scholar }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ScholarSelected handler error");
    }
  });

  // ── Slash / Complete ──────────────────────────────────────────────────

  ponder.on("ScholarshipCore:ScholarSlashed", async ({ event }) => {
    try {
      const { scholar, programId, dtype } = event.args;
      const statusMap: Record<number, NonNullable<typeof v4Scholars.$inferInsert["status"]>> = {
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
        .where(and(
          eq(v4Scholars.wallet, String(scholar)),
          eq(v4Scholars.blockchainProgramId, Number(programId)),
        ));

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

  // ── Date Management ──────────────────────────────────────────────────────────
  // Events emitted from ScholarshipCoreBase (now moved there to save bytecode),
  // but still indexed via the ScholarshipCore proxy address.

  ponder.on("ScholarshipCore:ApplicationDeadlineExtended", async ({ event }) => {
    try {
      const { programId, newEnd } = event.args;
      await db.update(v4Programs)
        .set({
          applicationEnd: new Date(Number(newEnd) * 1000),
          updatedAt: new Date(),
        })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await sendSseToAll("main", {
        step: "ApplicationDeadlineExtended",
        data: { programId: Number(programId), newEnd: Number(newEnd) },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "ApplicationDeadlineExtended handler error");
    }
  });

  ponder.on("ScholarshipCore:VotingDeadlineExtended", async ({ event }) => {
    try {
      const { programId, newEnd } = event.args;
      await db.update(v4Programs)
        .set({
          votingEnd: new Date(Number(newEnd) * 1000),
          updatedAt: new Date(),
        })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await sendSseToAll("main", {
        step: "VotingDeadlineExtended",
        data: { programId: Number(programId), newEnd: Number(newEnd) },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "VotingDeadlineExtended handler error");
    }
  });

  ponder.on("ScholarshipCore:AdminBypassStatusForced", async ({ event }) => {
    try {
      const { programId, newStatus } = event.args;
      const statusMap: Record<number, NonNullable<typeof v4Programs.$inferInsert["status"]>> = {
        0: "CREATED", 1: "APPLICATION_OPEN", 2: "SCREENING",
        3: "VOTING", 4: "ACTIVE", 5: "COMPLETED", 6: "CANCELLED",
      };
      const status = statusMap[Number(newStatus)] ?? "CREATED";

      await db.update(v4Programs)
        .set({ status, updatedAt: new Date() })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await sendSseToAll("main", {
        step: "AdminBypassStatusForced",
        data: { programId: Number(programId), status },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "AdminBypassStatusForced handler error");
    }
  });

  ponder.on("ScholarshipCore:AdminBypassDatesUpdated", async ({ event }) => {
    try {
      const { programId, appStart, appEnd, voteStart, voteEnd } = event.args;
      await db.update(v4Programs)
        .set({
          applicationStart: new Date(Number(appStart) * 1000),
          applicationEnd:   new Date(Number(appEnd) * 1000),
          votingStart:      new Date(Number(voteStart) * 1000),
          votingEnd:        new Date(Number(voteEnd) * 1000),
          updatedAt: new Date(),
        })
        .where(eq(v4Programs.blockchainId, Number(programId)));

      await sendSseToAll("main", {
        step: "AdminBypassDatesUpdated",
        data: { programId: Number(programId) },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "AdminBypassDatesUpdated handler error");
    }
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// TREASURY HANDLERS
// ══════════════════════════════════════════════════════════════════════════════

export const scholarshipTreasuryHandlers = () => {

  // ── FundDeposited — initiator depositing funds into program ────────────

  ponder.on("ScholarshipTreasury:FundDeposited", async ({ event }) => {
    try {
      const { programId, depositor, amount } = event.args;

      const [prog] = await db.select({ totalFund: v4Programs.totalFund })
        .from(v4Programs).where(eq(v4Programs.blockchainId, Number(programId))).limit(1);

      if (prog) {
        const prev = BigInt(prog.totalFund ?? "0");
        await db.update(v4Programs)
          .set({ totalFund: String(prev + BigInt(amount)), updatedAt: new Date() })
          .where(eq(v4Programs.blockchainId, Number(programId)));
      }

      await insertBlock({ event, eventName: "ScholarshipTreasury:FundDeposited" });
      await sendSseToAll("main", { step: "FundDeposited", data: { programId, depositor, amount: String(amount) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "FundDeposited handler error");
    }
  });

  // ── DonationRecorded — individual donor donation tracked ──────────────

  ponder.on("ScholarshipTreasury:DonationRecorded", async ({ event }) => {
    try {
      const { programId, donor, netAmount } = event.args;
      const progUuid = await findProgramUuid(Number(programId));

      await db.insert(v4Donations).values({
        programId: progUuid ?? undefined,
        blockchainProgramId: Number(programId),
        donor: String(donor),
        netAmount: String(netAmount),
      });

      await insertBlock({ event, eventName: "ScholarshipTreasury:DonationRecorded" });
      await sendSseToAll("main", { step: "DonationRecorded", data: { programId, donor, netAmount: String(netAmount) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "DonationRecorded handler error");
    }
  });

  // ── MilestoneDisbursed — funds sent to scholar on milestone approval ───

  ponder.on("ScholarshipTreasury:MilestoneDisbursed", async ({ event }) => {
    try {
      const { programId, scholar, milestoneId, amount } = event.args;

      // Update program spentFund
      const [prog] = await db.select({ spentFund: v4Programs.spentFund })
        .from(v4Programs).where(eq(v4Programs.blockchainId, Number(programId))).limit(1);

      if (prog) {
        const prev = BigInt(prog.spentFund ?? "0");
        await db.update(v4Programs)
          .set({ spentFund: String(prev + BigInt(amount)), updatedAt: new Date() })
          .where(eq(v4Programs.blockchainId, Number(programId)));
      }

      await insertBlock({ event, eventName: "ScholarshipTreasury:MilestoneDisbursed" });
      await sendSseToAll("main", { step: "MilestoneDisbursed", data: { programId, scholar, milestoneId, amount: String(amount) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "MilestoneDisbursed handler error");
    }
  });

  // ── SlashDistributed — funds redistributed after slash ─────────────────

  ponder.on("ScholarshipTreasury:SlashDistributed", async ({ event }) => {
    try {
      const { programId, scholar, bountyHunter, bhReward, treasuryAmount, protocolAmount } = event.args;

      // Update BH profile with reward
      const [bh] = await db.select().from(v4BountyHunters)
        .where(eq(v4BountyHunters.address, String(bountyHunter))).limit(1);

      if (bh) {
        const prevRewards = BigInt(bh.totalRewards ?? "0");
        await db.update(v4BountyHunters)
          .set({
            totalRewards: String(prevRewards + BigInt(bhReward)),
            totalWins: (bh.totalWins ?? 0) + 1,
            updatedAt: new Date(),
          })
          .where(eq(v4BountyHunters.address, String(bountyHunter)));
      }

      await insertBlock({ event, eventName: "ScholarshipTreasury:SlashDistributed" });
      await sendSseToAll("main", { step: "SlashDistributed", data: { programId, scholar, bountyHunter, bhReward: String(bhReward) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "SlashDistributed handler error");
    }
  });

  // ── ConfidenceStakeDeposited — duplicate of Core:ConfidenceStaked ──────
  //    Tracked in Treasury contract but data already captured via Core handler.
  //    We still log the block for completeness.

  ponder.on("ScholarshipTreasury:ConfidenceStakeDeposited", async ({ event }) => {
    try {
      await insertBlock({ event, eventName: "ScholarshipTreasury:ConfidenceStakeDeposited" });
    } catch (err) {
      logger.error({ err }, "ConfidenceStakeDeposited handler error");
    }
  });

  // ── ConfidenceStakeResolved — settle confidence stakes ────────────────

  ponder.on("ScholarshipTreasury:ConfidenceStakeResolved", async ({ event }) => {
    try {
      const { programId, voter, returned, bonus, slashed } = event.args;
      await db.update(v4ConfidenceStakes)
        .set({
          isResolved: true,
          wasSlashed: slashed,
          returnedAmount: String(returned),
          bonusAmount: String(bonus),
          updatedAt: new Date(),
        })
        .where(and(
          eq(v4ConfidenceStakes.voterAddress, String(voter)),
          eq(v4ConfidenceStakes.blockchainProgramId, Number(programId)),
        ));

      await insertBlock({ event, eventName: "ScholarshipTreasury:ConfidenceStakeResolved" });
      await sendSseToAll("main", { step: "ConfidenceStakeResolved", data: { programId, voter, slashed }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "ConfidenceStakeResolved handler error");
    }
  });

  // ── YieldAdded — DeFi yield accrued to program ────────────────────────

  ponder.on("ScholarshipTreasury:YieldAdded", async ({ event }) => {
    try {
      const { programId, amount } = event.args;

      const [prog] = await db.select({ yieldAccrued: v4Programs.yieldAccrued })
        .from(v4Programs).where(eq(v4Programs.blockchainId, Number(programId))).limit(1);

      if (prog) {
        const prev = BigInt(prog.yieldAccrued ?? "0");
        await db.update(v4Programs)
          .set({ yieldAccrued: String(prev + BigInt(amount)), updatedAt: new Date() })
          .where(eq(v4Programs.blockchainId, Number(programId)));
      }

      await insertBlock({ event, eventName: "ScholarshipTreasury:YieldAdded" });
    } catch (err) {
      logger.error({ err }, "YieldAdded handler error");
    }
  });

  // ── YieldDistributed — yield distributed to voters ────────────────────

  ponder.on("ScholarshipTreasury:YieldDistributed", async ({ event }) => {
    try {
      const { programId, totalYield } = event.args;
      await insertBlock({ event, eventName: "ScholarshipTreasury:YieldDistributed" });
      await sendSseToAll("main", { step: "YieldDistributed", data: { programId, totalYield: String(totalYield) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "YieldDistributed handler error");
    }
  });

  // ── YieldClaimed — individual voter claims yield ──────────────────────

  ponder.on("ScholarshipTreasury:YieldClaimed", async ({ event }) => {
    try {
      const { programId, voter, amount } = event.args;
      await insertBlock({ event, eventName: "ScholarshipTreasury:YieldClaimed" });
      await sendSseToAll("main", { step: "YieldClaimed", data: { programId, voter, amount: String(amount) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "YieldClaimed handler error");
    }
  });

  // ── DonorRefunded — refund on program cancellation ────────────────────

  ponder.on("ScholarshipTreasury:DonorRefunded", async ({ event }) => {
    try {
      const { programId, donor, amount } = event.args;
      await insertBlock({ event, eventName: "ScholarshipTreasury:DonorRefunded" });
      await sendSseToAll("main", { step: "DonorRefunded", data: { programId, donor, amount: String(amount) }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "DonorRefunded handler error");
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

  // ── BHFlagged — bounty hunter flagged and put on cooldown ─────────────

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

  // ── ForfeitedStakesWithdrawn — admin withdraws forfeited stakes ────────

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

// ══════════════════════════════════════════════════════════════════════════════
// COMMITTEE GOVERNANCE HANDLERS
// ══════════════════════════════════════════════════════════════════════════════

export const committeeGovernanceHandlers = () => {

  // ── CommitteeMemberAdded — new member assigned to program committee ────

  ponder.on("CommitteeGovernance:CommitteeMemberAdded", async ({ event }) => {
    try {
      const { programId, member } = event.args;
      const progUuid = await findProgramUuid(Number(programId));

      await db.insert(v4CommitteeMembers).values({
        programId: progUuid ?? undefined,
        blockchainProgramId: Number(programId),
        memberAddress: String(member),
        isActive: true,
      }).onConflictDoUpdate({
        target: [v4CommitteeMembers.memberAddress, v4CommitteeMembers.blockchainProgramId],
        set: { isActive: true, removedAt: null, addedAt: new Date() },
      });

      await insertBlock({ event, eventName: "CommitteeGovernance:CommitteeMemberAdded" });
      await sendSseToAll("main", { step: "CommitteeMemberAdded", data: { programId, member }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "CommitteeMemberAdded handler error");
    }
  });

  // ── CommitteeMemberRemoved — member removed from program committee ────

  ponder.on("CommitteeGovernance:CommitteeMemberRemoved", async ({ event }) => {
    try {
      const { programId, member } = event.args;

      await db.update(v4CommitteeMembers)
        .set({ isActive: false, removedAt: new Date() })
        .where(and(
          eq(v4CommitteeMembers.blockchainProgramId, Number(programId)),
          eq(v4CommitteeMembers.memberAddress, String(member)),
        ));

      await insertBlock({ event, eventName: "CommitteeGovernance:CommitteeMemberRemoved" });
      await sendSseToAll("main", { step: "CommitteeMemberRemoved", data: { programId, member }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "CommitteeMemberRemoved handler error");
    }
  });

  // ── ScoreSubmitted — committee member submitted a score for an applicant ─
  // v5: replaces MemberScoreSubmitted + ScoreFinalized + TiebreakerRequired.
  // Core accumulates scores and calls submitCommitteeScore() once all members
  // voted — so this single event covers both partial and final submission.

  ponder.on("CommitteeGovernance:ScoreSubmitted", async ({ event }) => {
    try {
      const { programId, applicant, score } = event.args;

      // Update applicant screening score — Core will overwrite with finalized
      // average when all members have voted, so last-write is always correct.
      await db.update(v4Applicants)
        .set({
          screeningScore: String(score),
          updatedAt: new Date(),
        })
        .where(and(
          eq(v4Applicants.blockchainProgramId, Number(programId)),
          eq(v4Applicants.wallet, String(applicant)),
        ));

      await insertBlock({ event, eventName: "CommitteeGovernance:ScoreSubmitted" });
      await sendSseToAll("main", { step: "ScoreSubmitted", data: { programId, applicant, score: String(score) }, status: true, blockHash: event.block.hash });
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
  // v5 new event: emitted by voteOnMilestone() before majority is reached.

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
  // v5 new event: emitted when approve or reject reaches majority.
  // MilestoneManager.approveMilestone() / rejectMilestone() is called inside
  // the contract, which will emit MilestoneApproved / MilestoneRejected on
  // MilestoneManager — those handlers will update v4_milestones.status.
  // Here we just update the vote record for auditability.

  ponder.on("CommitteeGovernance:MilestoneVoteResolved", async ({ event }) => {
    try {
      const { milestoneId, approved } = event.args;

      // Milestone status is updated by MilestoneManager:MilestoneApproved/Rejected handler.
      // Only send SSE so frontend knows vote is settled.
      await insertBlock({ event, eventName: "CommitteeGovernance:MilestoneVoteResolved" });
      await sendSseToAll("main", { step: "MilestoneVoteResolved", data: { milestoneId, approved }, status: true, blockHash: event.block.hash });
    } catch (err) {
      logger.error({ err }, "MilestoneVoteResolved handler error");
    }
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// MILESTONE MANAGER HANDLERS
// Semua event milestone sekarang emit dari MilestoneManager (v5).
// ScholarshipCore tidak lagi emit MilestoneSubmitted / Completed / Frozen / Released.
//
// Flow per tier:
//  MANDATORY : MilestoneCreated → MilestoneSubmitted → MilestoneCompleted
//                                                     → MilestoneFrozen (bounty dispute)
//                                                     → MilestoneReleased (dispute resolved)
//  OPTIONAL  : MilestoneProposed → MilestoneApproved / MilestoneRejected
//                               → MilestoneSubmitted → MilestoneCompleted
//  NEGOTIATED: (flow sama dengan OPTIONAL, kind=NEGOTIATED)
// ══════════════════════════════════════════════════════════════════════════════

export const milestoneManagerHandlers = () => {

  // ── MilestoneCreated — Core calls createMandatoryBatch() at selectWinners ─
  // Tier 1 (MANDATORY): dibuat otomatis oleh program creator saat pilih winner.

  ponder.on("MilestoneManager:MilestoneCreated", async ({ event }) => {
    try {
      const { id, programId, scholar, kind } = event.args;
      const mId = Number(id);

      // Resolve DB foreign keys
      const [scholarRow] = await db
        .select({ id: v4Scholars.id, programId: v4Scholars.programId })
        .from(v4Scholars)
        .where(and(
          eq(v4Scholars.wallet, String(scholar)),
          eq(v4Scholars.blockchainProgramId, Number(programId)),
        ))
        .limit(1);

      const progUuid = scholarRow?.programId ?? await findProgramUuid(Number(programId));

      // kind comes in as uint8 from enum MilestoneKind: 0=MANDATORY,1=OPTIONAL,2=NEGOTIATED
      const kindMap: Record<number, "MANDATORY" | "OPTIONAL" | "NEGOTIATED"> = {
        0: "MANDATORY", 1: "OPTIONAL", 2: "NEGOTIATED",
      };
      const kindStr = kindMap[Number(kind)] ?? "MANDATORY";

      await db.insert(v4Milestones).values({
        blockchainId: mId,
        programId: progUuid ?? undefined,
        scholarId: scholarRow?.id ?? undefined,
        scholarWallet: String(scholar),
        kind: kindStr,
        requiresProof: kindStr !== "MANDATORY",
        provider: String(event.args.provider),
        externalId: String(event.args.externalId),
        status: "PENDING",
      }).onConflictDoUpdate({
        target: [v4Milestones.blockchainId],
        set: { 
          kind: kindStr, 
          requiresProof: kindStr !== "MANDATORY", 
          provider: String(event.args.provider),
          externalId: String(event.args.externalId),
          status: "PENDING", 
          updatedAt: new Date() 
        },
      });

      await insertBlock({ event, eventName: "MilestoneManager:MilestoneCreated" });
      await sendSseToAll("main", {
        step: "MilestoneCreated",
        data: { milestoneId: mId, programId: Number(programId), scholar, kind: kindStr },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "MilestoneManager:MilestoneCreated handler error");
    }
  });

  // ── MilestoneProposed — scholar proposes OPTIONAL or NEGOTIATED milestone ─
  // Tier 2 & 3: status = PROPOSED, menunggu committee approval.

  ponder.on("MilestoneManager:MilestoneProposed", async ({ event }) => {
    try {
      const { id, programId, scholar, kind } = event.args;
      const mId = Number(id);

      const [scholarRow] = await db
        .select({ id: v4Scholars.id, programId: v4Scholars.programId })
        .from(v4Scholars)
        .where(and(
          eq(v4Scholars.wallet, String(scholar)),
          eq(v4Scholars.blockchainProgramId, Number(programId)),
        ))
        .limit(1);

      const kindMap: Record<number, "MANDATORY" | "OPTIONAL" | "NEGOTIATED"> = {
        0: "MANDATORY", 1: "OPTIONAL", 2: "NEGOTIATED",
      };
      const kindStr = kindMap[Number(kind)] ?? "OPTIONAL";

      await db.insert(v4Milestones).values({
        blockchainId: mId,
        programId: scholarRow?.programId ?? undefined,
        scholarId: scholarRow?.id ?? undefined,
        scholarWallet: String(scholar),
        kind: kindStr,
        requiresProof: kindStr !== "MANDATORY",
        proposedBy: String(scholar),
        provider: String(event.args.provider),
        externalId: String(event.args.externalId),
        status: "PROPOSED",
      }).onConflictDoUpdate({
        target: [v4Milestones.blockchainId],
        set: { 
          status: "PROPOSED", 
          requiresProof: kindStr !== "MANDATORY", 
          proposedBy: String(scholar), 
          provider: String(event.args.provider),
          externalId: String(event.args.externalId),
          updatedAt: new Date() 
        },
      });

      await insertBlock({ event, eventName: "MilestoneManager:MilestoneProposed" });
      await sendSseToAll("main", {
        step: "MilestoneProposed",
        data: { milestoneId: mId, programId: Number(programId), scholar, kind: kindStr },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "MilestoneManager:MilestoneProposed handler error");
    }
  });

  // ── MilestoneApproved — committee approves OPTIONAL/NEGOTIATED proposal ──
  // Status PROPOSED → PENDING. Scholar kini bisa submit proof.

  ponder.on("MilestoneManager:MilestoneApproved", async ({ event }) => {
    try {
      const { id, approvedBy } = event.args;

      await db.update(v4Milestones)
        .set({ status: "PENDING", approvedBy: String(approvedBy), updatedAt: new Date() })
        .where(eq(v4Milestones.blockchainId, Number(id)));

      // Need to find programId to sync allocated fund
      const [mRow] = await db.select({ programId: v4Milestones.programId })
        .from(v4Milestones).where(eq(v4Milestones.blockchainId, Number(id))).limit(1);

      if (mRow && mRow.programId) {
        const [prog] = await db.select({ blockchainId: v4Programs.blockchainId })
          .from(v4Programs).where(eq(v4Programs.id, mRow.programId)).limit(1);

        if (prog) {
          const coreAddress = await context.client.readContract({
            abi: [{ "inputs": [], "name": "_coreContract", "outputs": [{ "internalType": "contract IScholarshipCoreMin", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }],
            address: event.log.address as `0x${string}`,
            functionName: "_coreContract"
          });
          const progSync: any = await context.client.readContract({
            abi: scholarshipCoreAbi,
            address: coreAddress as `0x${string}`,
            functionName: "getProgram",
            args: [BigInt(prog.blockchainId)],
          });
          await db.update(v4Programs)
            .set({ allocatedFund: String(progSync.allocatedFund), updatedAt: new Date() })
            .where(eq(v4Programs.id, mRow.programId));
        }
      }

      await insertBlock({ event, eventName: "MilestoneManager:MilestoneApproved" });
      await sendSseToAll("main", {
        step: "MilestoneApproved",
        data: { milestoneId: Number(id), approvedBy },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "MilestoneManager:MilestoneApproved handler error");
    }
  });

  // ── MilestoneRejected — committee menolak proposal ────────────────────
  // Slot optional dibebaskan (contract swap-and-pop), scholar bisa propose ulang.

  ponder.on("MilestoneManager:MilestoneRejected", async ({ event }) => {
    try {
      const { id, rejectedBy } = event.args;

      await db.update(v4Milestones)
        .set({ status: "REJECTED", approvedBy: String(rejectedBy), updatedAt: new Date() })
        .where(eq(v4Milestones.blockchainId, Number(id)));

      await insertBlock({ event, eventName: "MilestoneManager:MilestoneRejected" });
      await sendSseToAll("main", {
        step: "MilestoneRejected",
        data: { milestoneId: Number(id), rejectedBy },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "MilestoneManager:MilestoneRejected handler error");
    }
  });

  // ── MilestoneSubmitted — scholar submit proof untuk milestone PENDING ─
  // Berlaku untuk semua tier (MANDATORY / OPTIONAL / NEGOTIATED).
  // Contract: submitProof() → set status=SUBMITTED + disputeDeadline.

  ponder.on("MilestoneManager:MilestoneSubmitted", async ({ event }) => {
    try {
      const { id, scholar, proofCID } = event.args;
      const mId = Number(id);
      const submittedAt = new Date(Number(event.block.timestamp) * 1000);

      await db.insert(v4Milestones).values({
        blockchainId: mId,
        scholarWallet: String(scholar),
        proofCID: String(proofCID),
        status: "SUBMITTED",
        submittedAt,
      }).onConflictDoUpdate({
        target: [v4Milestones.blockchainId],
        set: {
          proofCID: String(proofCID),
          status: "SUBMITTED",
          submittedAt,
          updatedAt: new Date(),
        },
      });

      await insertBlock({ event, eventName: "MilestoneManager:MilestoneSubmitted" });
      await sendSseToAll("main", {
        step: "MilestoneSubmitted",
        data: { milestoneId: mId, scholar },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "MilestoneManager:MilestoneSubmitted handler error");
    }
  });

  // ── MilestoneCompleted — dispute window lewat, executeMilestone() dipanggil ─
  // Atau forceCompleteMilestone() setelah dispute BH menang.
  // Treasury sudah disbursed. Core sudah update progress & mungkin NFT.

  ponder.on("MilestoneManager:MilestoneCompleted", async ({ event }) => {
    try {
      const { id, scholar, amount } = event.args;
      const mId = Number(id);

      await db.update(v4Milestones)
        .set({
          status: "COMPLETED",
          amount: String(amount),
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(v4Milestones.blockchainId, mId));

      // Sync totalReceived ke v4_scholars
      const [milestone] = await db
        .select({ scholarId: v4Milestones.scholarId })
        .from(v4Milestones)
        .where(eq(v4Milestones.blockchainId, mId))
        .limit(1);

      if (milestone?.scholarId) {
        const [existingScholar] = await db
          .select({ totalReceived: v4Scholars.totalReceived })
          .from(v4Scholars)
          .where(eq(v4Scholars.id, milestone.scholarId))
          .limit(1);

        if (existingScholar) {
          const prev = BigInt(existingScholar.totalReceived ?? "0");
          await db.update(v4Scholars)
            .set({ totalReceived: String(prev + BigInt(amount)), updatedAt: new Date() })
            .where(eq(v4Scholars.id, milestone.scholarId));
        }

        // Sync spentFund and allocatedFund back to v4Programs
        const [prog] = await db.select({ blockchainId: v4Programs.blockchainId })
          .from(v4Programs)
          .where(eq(v4Programs.id, milestone.programId!))
          .limit(1);

        if (prog) {
          const coreAddress = await context.client.readContract({
            abi: [{ "inputs": [], "name": "_coreContract", "outputs": [{ "internalType": "contract IScholarshipCoreMin", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }],
            address: event.log.address as `0x${string}`,
            functionName: "_coreContract"
          });
          const progSync: any = await context.client.readContract({
            abi: scholarshipCoreAbi,
            address: coreAddress as `0x${string}`,
            functionName: "getProgram",
            args: [BigInt(prog.blockchainId)],
          });
          await db.update(v4Programs)
            .set({ 
              spentFund: String(progSync.spentFund),
              allocatedFund: String(progSync.allocatedFund), 
              updatedAt: new Date() 
            })
            .where(eq(v4Programs.blockchainId, prog.blockchainId));
        }
      }

      await insertBlock({ event, eventName: "MilestoneManager:MilestoneCompleted" });
      await sendSseToAll("main", {
        step: "MilestoneCompleted",
        data: { milestoneId: mId, scholar, amount: String(amount) },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "MilestoneManager:MilestoneCompleted handler error");
    }
  });

  // ── MilestoneFrozen — ScholarshipBounty panggil freezeMilestone() ─────
  // Milestone di-freeze selama dispute bounty berlangsung.

  ponder.on("MilestoneManager:MilestoneFrozen", async ({ event }) => {
    try {
      const { id } = event.args;
      await db.update(v4Milestones)
        .set({ status: "FROZEN", updatedAt: new Date() })
        .where(eq(v4Milestones.blockchainId, Number(id)));

      await insertBlock({ event, eventName: "MilestoneManager:MilestoneFrozen" });
      await sendSseToAll("main", {
        step: "MilestoneFrozen",
        data: { milestoneId: Number(id) },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "MilestoneManager:MilestoneFrozen handler error");
    }
  });

  // ── MilestoneReleased — dispute selesai, milestone kembali ke SUBMITTED ─
  // disputeDeadline di-reset ke block.timestamp + milestoneDisputeWindow.

  ponder.on("MilestoneManager:MilestoneReleased", async ({ event }) => {
    try {
      const { id } = event.args;
      await db.update(v4Milestones)
        .set({ status: "SUBMITTED", updatedAt: new Date() })
        .where(eq(v4Milestones.blockchainId, Number(id)));

      await insertBlock({ event, eventName: "MilestoneManager:MilestoneReleased" });
      await sendSseToAll("main", {
        step: "MilestoneReleased",
        data: { milestoneId: Number(id) },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "MilestoneManager:MilestoneReleased handler error");
    }
  });
};