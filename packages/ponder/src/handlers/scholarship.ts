import { ponder } from "ponder:registry";
import { db } from "@/db";
import { and, eq, InferInsertModel } from "drizzle-orm";
import { milestones, programs, students, votes } from "@/db/schema";
import { fetchFromIPFS, isValidCID } from "../utils/ipfs";
import { logger } from "@/utils/logger";
import { insertBlock } from "@/services/block.log.service";
import moment from "moment";
import { isEmpty } from "lodash";
export const scholarship = () => {

  ponder.on("scholarship:ProgramCreated", async ({ event }) => {
    const { allocation, creator, id, metadataCID, totalFund } = event.args;

    let baseData: InferInsertModel<typeof programs> = {
      milestoneType: Number(allocation) === 0 ? "FIXED" : "USER_DEFINED",
      creator: String(creator),
      programId: Number(id),
      totalFund: Number(totalFund),
      metadataCID: metadataCID,
    };

    const trimmedCID = metadataCID?.replace(/^['"]+|['"]+$/g, '')?.trim();
    if (trimmedCID && trimmedCID !== "''" && isValidCID(trimmedCID)) {
      const ipfsData = await fetchFromIPFS(trimmedCID);

      baseData = {
        ...baseData,
        name: ipfsData.attributes?.[0]?.scholarshipName as string || '',
        description: ipfsData.attributes?.[0]?.description as string || '',
        totalRecipients: ipfsData.attributes?.[0]?.recipientCount as number || 1,
        endAt: moment(ipfsData.attributes?.[0]?.deadline as string || '').format("YYYY-MM-DD").toString(),
        startAt: moment().add(2, 'days').format("YYYY-MM-DD"),
      };
    }
    logger.info({ baseData }, "Program Created");

    await db.insert(programs).values(baseData).onConflictDoNothing();

    await insertBlock({ event, eventName: "scholarship:ProgramCreated" });

    logger.info({ id }, "Program Created");
  });

  ponder.on("scholarship:ApplicantRegistered", async ({ event }) => {
    const { applicantAddress, programId, id } = event.args;

    await db.insert(students).values({
      programId: Number(programId),
      studentId: Number(id),
      studentAddress: String(applicantAddress),
    }).onConflictDoNothing();

    await insertBlock({ event, eventName: "scholarship:ApplicantRegistered" });

    logger.info({ id }, " Student Created");
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

    await insertBlock({ event, eventName: "scholarship:OnVoted" });


    logger.info({ voter }, " Voter Created");
  });

  ponder.on("scholarship:MilestoneAdded", async ({ event }) => {
    const { metadataCID, amount, creator, id, programId } = event.args;

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.studentAddress, creator));

    if (!student) {
      console.warn(`Student not found for address: ${creator}`);
      return;
    }

    await db.insert(milestones).values({
      amount: Number(amount),
      milestoneId: Number(id),
      studentId: student.studentId,
      programId: Number(programId),
      metadataCID: metadataCID
    }).onConflictDoNothing();

    await insertBlock({ event, eventName: "scholarship:MilestoneAdded" });

    logger.info({ id }, " Milestones Created");

  });

  ponder.on("scholarship:WithdrawMilestone", async ({ event }) => {
    const { applicantId, programId } = event.args;
    await db.update(milestones)
      .set({
        isCollected: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(milestones.programId, Number(programId)),
          eq(milestones.studentId, Number(applicantId))
        )
      );

    await insertBlock({ event, eventName: "scholarship:WithdrawMilestone" });

    logger.info({ applicantId, programId }, " Milestones Withdraw");
  });

  ponder.on("scholarship:SubmitMilestone", async ({ event }) => {
    const { milestoneId, proveCID } = event.args;

    await db.update(milestones)
      .set({
        proveCID: proveCID,
        updatedAt: new Date(),
      })
      .where(eq(milestones.milestoneId, Number(milestoneId)));

    await insertBlock({ event, eventName: "scholarship:SubmitMilestone" });

    logger.info({ milestoneId, proveCID }, " Milestones Submited");
  });

};