import { ponder } from "ponder:registry";
import { db } from "@/db";
import { v4Milestones, v4Scholars, v4Programs, v4CommitteeMilestoneVotes } from "@/db/schema";
import { scholarshipCoreAbi } from "abis/v4/ScholarshipCore";
import { logger } from "@/utils/logger";
import { insertBlock } from "@/services/block.log.service";
import { sendSseToAll } from "@/api/controller/sse.controller";
import { eq, and } from "drizzle-orm";
import { hexToString } from "viem";
import { findProgramUuid } from "./helpers";

export const milestoneManagerHandlers = () => {

  // ── MilestoneCreated — Core calls createMandatoryBatch() at selectWinners ─

  ponder.on("MilestoneManager:MilestoneCreated", async ({ event }) => {
    try {
      const { id, pid, scholar, kind } = event.args;
      const mId = Number(id);

      const [scholarRow] = await db
        .select({ id: v4Scholars.id, programId: v4Scholars.programId })
        .from(v4Scholars)
        .where(and(
          eq(v4Scholars.wallet, String(scholar)),
          eq(v4Scholars.pid, Number(pid)),
        ))
        .limit(1);

      const progUuid = scholarRow?.programId ?? await findProgramUuid(Number(pid));

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
        provider: event.args.provider === "0x0000000000000000000000000000000000000000000000000000000000000000" ? "" : hexToString(event.args.provider, { size: 32 }).replace(/\0/g, ""),
        externalId: event.args.externalId === "0x0000000000000000000000000000000000000000000000000000000000000000" ? "" : hexToString(event.args.externalId, { size: 32 }).replace(/\0/g, ""),
        status: "PENDING",
      }).onConflictDoUpdate({
        target: [v4Milestones.blockchainId],
        set: { 
          kind: kindStr, 
          requiresProof: kindStr !== "MANDATORY", 
          provider: event.args.provider === "0x0000000000000000000000000000000000000000000000000000000000000000" ? "" : hexToString(event.args.provider, { size: 32 }).replace(/\0/g, ""),
          externalId: event.args.externalId === "0x0000000000000000000000000000000000000000000000000000000000000000" ? "" : hexToString(event.args.externalId, { size: 32 }).replace(/\0/g, ""),
          status: "PENDING", 
          updatedAt: new Date() 
        },
      });

      await insertBlock({ event, eventName: "MilestoneManager:MilestoneCreated" });
      await sendSseToAll("main", {
        step: "MilestoneCreated",
        data: { milestoneId: mId, pid: Number(pid), scholar, kind: kindStr },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "MilestoneManager:MilestoneCreated handler error");
    }
  });

  // ── MilestoneProposed — scholar proposes OPTIONAL or NEGOTIATED milestone ─

  ponder.on("MilestoneManager:MilestoneProposed", async ({ event }) => {
    try {
      const { id, pid, scholar, kind } = event.args;
      const mId = Number(id);

      const [scholarRow] = await db
        .select({ id: v4Scholars.id, programId: v4Scholars.programId })
        .from(v4Scholars)
        .where(and(
          eq(v4Scholars.wallet, String(scholar)),
          eq(v4Scholars.pid, Number(pid)),
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
        provider: event.args.provider === "0x0000000000000000000000000000000000000000000000000000000000000000" ? "" : hexToString(event.args.provider, { size: 32 }).replace(/\0/g, ""),
        externalId: event.args.externalId === "0x0000000000000000000000000000000000000000000000000000000000000000" ? "" : hexToString(event.args.externalId, { size: 32 }).replace(/\0/g, ""),
        status: "PROPOSED",
      }).onConflictDoUpdate({
        target: [v4Milestones.blockchainId],
        set: { 
          status: "PROPOSED", 
          requiresProof: kindStr !== "MANDATORY", 
          proposedBy: String(scholar), 
          provider: event.args.provider === "0x0000000000000000000000000000000000000000000000000000000000000000" ? "" : hexToString(event.args.provider, { size: 32 }).replace(/\0/g, ""),
          externalId: event.args.externalId === "0x0000000000000000000000000000000000000000000000000000000000000000" ? "" : hexToString(event.args.externalId, { size: 32 }).replace(/\0/g, ""),
          updatedAt: new Date() 
        },
      });

      await insertBlock({ event, eventName: "MilestoneManager:MilestoneProposed" });
      await sendSseToAll("main", {
        step: "MilestoneProposed",
        data: { milestoneId: mId, pid: Number(pid), scholar, kind: kindStr },
        status: true, blockHash: event.block.hash,
      });
    } catch (err) {
      logger.error({ err }, "MilestoneManager:MilestoneProposed handler error");
    }
  });

  // ── MilestoneApproved — committee approves OPTIONAL/NEGOTIATED proposal ──

  ponder.on("MilestoneManager:MilestoneApproved", async ({ event, context: ctx }) => {
    try {
      const { id, approvedBy } = event.args;

      await db.update(v4Milestones)
        .set({ status: "PENDING", approvedBy: String(approvedBy), updatedAt: new Date() })
        .where(eq(v4Milestones.blockchainId, Number(id)));

      const [mRow] = await db.select({ programId: v4Milestones.programId })
        .from(v4Milestones).where(eq(v4Milestones.blockchainId, Number(id))).limit(1);

      if (mRow && mRow.programId) {
        const [prog] = await db.select({ pid: v4Programs.pid })
          .from(v4Programs).where(eq(v4Programs.id, mRow.programId)).limit(1);

        if (prog) {
          const coreAddress = await ctx.client.readContract({
            abi: [{ "inputs": [], "name": "_coreContract", "outputs": [{ "internalType": "contract IScholarshipCoreMin", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }],
            address: event.log.address as `0x${string}`,
            functionName: "_coreContract"
          });
          const progSync: any = await ctx.client.readContract({
            abi: scholarshipCoreAbi,
            address: coreAddress as `0x${string}`,
            functionName: "getProgram",
            args: [BigInt(prog.pid)],
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

  ponder.on("MilestoneManager:MilestoneCompleted", async ({ event, context: ctx }) => {
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

      const [milestone] = await db
        .select({ scholarId: v4Milestones.scholarId, programId: v4Milestones.programId })
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

        if (milestone.programId) {
          const [prog] = await db.select({ pid: v4Programs.pid })
            .from(v4Programs)
            .where(eq(v4Programs.id, milestone.programId))
            .limit(1);

          if (prog) {
            const coreAddress = await ctx.client.readContract({
              abi: [{ "inputs": [], "name": "_coreContract", "outputs": [{ "internalType": "contract IScholarshipCoreMin", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }],
              address: event.log.address as `0x${string}`,
              functionName: "_coreContract"
            });
            const progSync: any = await ctx.client.readContract({
              abi: scholarshipCoreAbi,
              address: coreAddress as `0x${string}`,
              functionName: "getProgram",
              args: [BigInt(prog.pid)],
            });
            await db.update(v4Programs)
              .set({ 
                spentFund: String(progSync.spentFund),
                allocatedFund: String(progSync.allocatedFund), 
                updatedAt: new Date() 
              })
              .where(eq(v4Programs.pid, prog.pid));
          }
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
