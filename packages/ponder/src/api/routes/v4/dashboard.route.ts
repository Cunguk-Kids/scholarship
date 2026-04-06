import { Hono } from "hono";
import { db } from "@/db";
import {
  v4Programs, v4Applicants, v4Scholars,
  v4Milestones, v4Votes, v4Disputes,
  v4Reputation, v4ConfidenceStakes,
  v4CommitteeMembers,
} from "@/db/schema";
import { eq, or, desc, and } from "drizzle-orm";

export const dashboardRoute = new Hono();

/**
 * GET /:wallet — Aggregated dashboard data for a wallet
 *
 * Returns all roles the wallet has in the protocol:
 *   - Programs created (as initiator)
 *   - Applications submitted (as student)
 *   - Scholar records (accepted scholars)
 *   - Votes cast (as donor)
 *   - Disputes (as BH or scholar)
 *   - Reputation balance
 *   - Confidence stakes
 *   - Committee memberships (programs where wallet is an active committee member)
 */
dashboardRoute.get("/:wallet", async (c) => {
  try {
    const wallet = c.req.param("wallet");

    const programsCreated = await db.select().from(v4Programs)
      .where(eq(v4Programs.initiator, wallet))
      .orderBy(desc(v4Programs.createdAt));

    const applications = await db.select({
      applicant: v4Applicants,
      program: {
        id: v4Programs.id,
        pid: v4Programs.pid,
        metadataCID: v4Programs.metadataCID,
        status: v4Programs.status,
        totalFund: v4Programs.totalFund,
      },
    })
      .from(v4Applicants)
      .leftJoin(v4Programs, eq(v4Applicants.programId, v4Programs.id))
      .where(eq(v4Applicants.wallet, wallet))
      .orderBy(desc(v4Applicants.createdAt));

    const scholarships = await db.select({
      scholar: v4Scholars,
      program: {
        id: v4Programs.id,
        pid: v4Programs.pid,
        metadataCID: v4Programs.metadataCID,
        status: v4Programs.status,
        totalFund: v4Programs.totalFund,
      },
    })
      .from(v4Scholars)
      .leftJoin(v4Programs, eq(v4Scholars.programId, v4Programs.id))
      .where(eq(v4Scholars.wallet, wallet))
      .orderBy(desc(v4Scholars.createdAt));

    const milestones = await db.select().from(v4Milestones)
      .where(eq(v4Milestones.scholarWallet, wallet))
      .orderBy(v4Milestones.blockchainId);

    const votes = await db.select().from(v4Votes)
      .where(eq(v4Votes.voterAddress, wallet))
      .orderBy(desc(v4Votes.createdAt));

    const stakes = await db.select().from(v4ConfidenceStakes)
      .where(eq(v4ConfidenceStakes.voterAddress, wallet))
      .orderBy(desc(v4ConfidenceStakes.createdAt));

    const disputes = await db.select().from(v4Disputes)
      .where(or(
        eq(v4Disputes.bountyHunter, wallet),
        eq(v4Disputes.scholarAddress, wallet),
      ))
      .orderBy(desc(v4Disputes.createdAt));

    const [reputation] = await db.select().from(v4Reputation)
      .where(eq(v4Reputation.address, wallet))
      .limit(1);

    // ── Committee memberships ──────────────────────────────────────────────────
    // Find all programs where this wallet is an active committee member.
    // This is the REAL source of truth — on-chain events via Ponder indexer.
    const committeeMemberships = await db.select({
      membership: v4CommitteeMembers,
      program: v4Programs,
    })
      .from(v4CommitteeMembers)
      .innerJoin(v4Programs, eq(v4CommitteeMembers.programId, v4Programs.id))
      .where(and(
        eq(v4CommitteeMembers.memberAddress, wallet),
        eq(v4CommitteeMembers.isActive, true),
      ))
      .orderBy(desc(v4CommitteeMembers.addedAt));

    const committeePrograms = committeeMemberships.map((m) => m.program);

    const totalReceived = scholarships.reduce(
      (sum, s) => sum + BigInt(s.scholar.totalReceived ?? "0"), 0n
    );

    const totalCreatedFund = programsCreated.reduce(
      (sum, p) => sum + BigInt(p.totalFund ?? "0"), 0n
    );

    return c.json({
      data: {
        wallet,
        summary: {
          programsCreatedCount: programsCreated.length,
          applicationsCount: applications.length,
          scholarshipsCount: scholarships.length,
          votesCount: votes.length,
          disputesCount: disputes.length,
          committeeProgramsCount: committeePrograms.length,
          totalFundReceived: String(totalReceived),
          totalFundCreated: String(totalCreatedFund),
          repBalance: reputation?.repBalance ?? "0",
        },
        programsCreated,
        applications,
        scholarships,
        milestones,
        votes,
        stakes,
        disputes,
        reputation: reputation ?? null,
        committeePrograms,
      },
    });
  } catch (err) {
    return c.json({ error: "Failed to fetch dashboard", details: String(err) }, 500);
  }
});
