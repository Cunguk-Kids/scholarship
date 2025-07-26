import { ponder } from "ponder:registry";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { milestones, programs, students, votes } from "@/db/schema";
import { fetchFromIPFS } from "../utils/ipfs";
import { logger } from "@/utils/logger";
import { insertBlock } from "@/services/block.log.service";
export const scholarship = () => {

  ponder.on("scholarship:ProgramCreated", async ({ event }) => {
    const { allocation, creator, id, metadataCID, totalFund } = event.args;

    const existing = await db
      .select()
      .from(programs)
      .where(eq(programs.programId, Number(id)));

    if (existing.length === 0) {
      await db.insert(programs).values({
        milestoneType: Number(allocation) === 0 ? "FIXED" : "USER_DEFINED",
        creator: String(creator),
        programId: Number(id),
        totalFund: Number(totalFund),
        metadataCID,
      }).onConflictDoNothing();

      await insertBlock({});

      logger.info({ id }, "✅ Program inserted");
    } else {
      logger.info({ id }, "⚠️ Program already exists, skipping insert");
    }
  });

  ponder.on("scholarship:ApplicantRegistered", async ({ event }) => {
    const { applicantAddress, programId, id } = event.args;

    const exists = await db
      .select()
      .from(students)
      .where(eq(students.studentId, Number(id)));

    if (exists.length === 0) {
      await db.insert(students).values({
        programId: Number(programId),
        studentId: Number(id),
        studentAddress: String(applicantAddress),
      }).onConflictDoNothing();

      logger.info({ id }, "✅ Student inserted");
    } else {
      logger.info({ id }, "⚠️ Student already exists, skipping insert");
    }
  });

  ponder.on("scholarship:OnVoted", async ({ event }) => {
    const { applicant, programId, voter } = event.args;

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.studentAddress, applicant));

    if (!student) {
      console.warn(`Student not found for address: ${applicant}`);
      return;
    }

    await db.insert(votes).values({
      address: String(voter),
      programId: Number(programId),
      studentId: student.studentId,
    }).onConflictDoNothing();
  });

  ponder.on("scholarship:OnVoted", async ({ event }) => {
    const { applicant, programId, voter } = event.args;

    const student = await db
      .select()
      .from(students)
      .where(eq(students.studentAddress, applicant));

    await db.insert(votes).values({
      address: String(voter),
      programId: Number(programId),
      studentId: Number(student?.[0]?.studentId)
    }).onConflictDoNothing();
  });

  ponder.on("scholarship:WithdrawMilestone", async ({ event }) => {
    const { applicantId, programId } = event.args;

    // await db.insert(programs).values({

    // });
  });

  ponder.on("scholarship:SubmitMilestone", async ({ event }) => {
    const { milestoneId, proveCID } = event.args;

    const existing = await db
      .select()
      .from(milestones)
      .where(eq(milestones.milestoneId, Number(milestoneId)));

    if (existing.length === 0) {
      await db.insert(milestones).values({
        milestoneId: Number(milestoneId),
        description: proveCID,
        isCollected: false,
      }).onConflictDoNothing();

      logger.info({ milestoneId }, "✅ Milestone inserted");
    } else {
      logger.info({ milestoneId }, "⚠️ Milestone already exists, skipping insert");
    }
  });

};