import { ponder } from "ponder:registry";
import { db } from "@/db";
import { and, eq, InferEnum, InferInsertModel } from "drizzle-orm";
import { milestones, MilestoneTypeEnum, programs, students, votes } from "@/db/schema";
import { fetchFromIPFS, isValidCID } from "../utils/ipfs";
import { logger } from "@/utils/logger";
import { insertBlock } from "@/services/block.log.service";
import moment from "moment";
import { isEmpty } from "lodash";
export const scholarship = () => {

  ponder.on("scholarship:ProgramCreated", async ({ event }) => {
    try {
      const { allocation, creator, id, metadataCID, totalFund } = event.args;


      const trimmedCID = metadataCID?.replace(/^['"]+|['"]+$/g, '')?.trim();
      let baseData: InferInsertModel<typeof programs> = {
        milestoneType: Number(allocation) === 0 ? "FIXED" : "USER_DEFINED",
        creator: String(creator),
        blockchainId: Number(id),
        totalFund: Number(totalFund),
        metadataCID: String(trimmedCID) || null,
        name: '',
        description: '',
        totalRecipients: 1,
        endAt: moment().format("YYYY-MM-DD"),
        startAt: moment().add(2, 'days').format("YYYY-MM-DD"),
        rules: "",
        votingAt: moment().add(2, 'days').format("YYYY-MM-DD"),
      };
      if (trimmedCID && trimmedCID !== "''" && isValidCID(trimmedCID)) {
        logger.info({ trimmedCID }, "CID Data Program");
        const ipfsData = await fetchFromIPFS(trimmedCID);
        logger.info({ ipfsData }, "IPFS Data Program");

        if (!isEmpty(ipfsData)) {
          baseData = {
            ...baseData,
            name: ipfsData?.attributes?.[0]?.scholarshipName as string || '',
            description: ipfsData?.attributes?.[0]?.description as string || '',
            totalRecipients: ipfsData?.attributes?.[0]?.recipientCount as number || 1,
            endAt: moment(ipfsData?.attributes?.[0]?.deadline as string || '').format("YYYY-MM-DD").toString(),
            startAt: moment().add(2, 'days').format("YYYY-MM-DD"),
          };
        }
      }
      const cleanedData = Object.fromEntries(
        Object.entries(baseData).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );

      logger.info({ cleanedData }, "Cleaned Data Program");

      const result = await db.insert(programs).values(cleanedData).onConflictDoNothing();

      logger.info({ result }, "Result Insert Data Program");

      await insertBlock({ event, eventName: "scholarship:ProgramCreated" });

      logger.info({ id }, "Program Created");
    } catch (error) {

      logger.error({ error }, "Create Program Error");
    }
  });

  ponder.on("scholarship:ApplicantRegistered", async ({ event }) => {
    const { applicantAddress, programId, id, metadataCID } = event.args;

    logger.info({ applicantAddress, programId, id }, " Student Param");

    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.blockchainId, Number(programId)));

    if (!program) {
      return;
    }


    const trimmedCID = metadataCID?.replace(/^['"]+|['"]+$/g, '')?.trim();
    let baseData: InferInsertModel<typeof students> = {
      programId: program.id,
      blockchainId: Number(id),
      studentAddress: String(applicantAddress),
    };

    if (trimmedCID && trimmedCID !== "''" && isValidCID(trimmedCID)) {
      logger.info({ trimmedCID }, "CID Data Program");
      const ipfsData = await fetchFromIPFS(trimmedCID);
      logger.info({ ipfsData }, "IPFS Data Program");

      if (!isEmpty(ipfsData)) {
        baseData = {
          ...baseData,
          email: ipfsData?.attributes?.[0]?.email as string || '',
          fullName: ipfsData?.attributes?.[0]?.fullName as string || '',
          financialSituation: ipfsData?.attributes?.[0]?.fullName as string || '',
          scholarshipMotivation: ipfsData?.attributes?.[0]?.fullName as string || '',
        };
      }
    }
    const cleanedData = Object.fromEntries(
      Object.entries(baseData).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );

    logger.info({ cleanedData }, "Cleaned Data Milestone");


    await db.insert(students).values(cleanedData).onConflictDoNothing();

    await insertBlock({ event, eventName: "scholarship:ApplicantRegistered" });

    logger.info({ id }, " Student Created");
  });

  ponder.on("scholarship:OnVoted", async ({ event }) => {
    const { applicant, programId, voter } = event.args;

    logger.info({ applicant, programId, voter }, " On Voted Param");

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.studentAddress, applicant));

    if (!student) {
      return;
    }

    await db.insert(votes).values({
      address: String(voter),
      programId: student.programId,
      studentId: student.id,
      blockchainProgramId: Number(programId),
      blockchainStudentId: Number(student.blockchainId)
    }).onConflictDoUpdate({
      target: [votes.address, votes.programId, votes.studentId],
      set: {
        address: String(voter),
        programId: student.programId,
        studentId: student.id,
        blockchainProgramId: Number(programId),
        blockchainStudentId: Number(student.blockchainId)
      },
    });

    await insertBlock({ event, eventName: "scholarship:OnVoted" });


    logger.info({ voter }, " Voter Created");
  });

  ponder.on("scholarship:MilestoneAdded", async ({ event }) => {
    const { metadataCID, amount, creator, id, programId } = event.args;

    logger.info({ metadataCID, amount, creator, id, programId }, "Milestone Param");
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.studentAddress, creator));

    if (!student) {
      return;
    }

    const trimmedCID = metadataCID?.replace(/^['"]+|['"]+$/g, '')?.trim();
    let baseData: InferInsertModel<typeof milestones> = {
      amount: Number(amount),
      blockchainId: Number(id),
      studentId: student.id,
      programId: student.programId,
      metadataCID: metadataCID,
    };

    if (trimmedCID && trimmedCID !== "''" && isValidCID(trimmedCID)) {
      logger.info({ trimmedCID }, "CID Data Program");
      const ipfsData = await fetchFromIPFS(trimmedCID);
      logger.info({ ipfsData }, "IPFS Data Program");

      if (!isEmpty(ipfsData)) {
        baseData = {
          ...baseData,
          description: ipfsData?.attributes?.[0]?.description as string || '',
          estimation: ipfsData?.attributes?.[0]?.estimation as number || 0,
          type: ipfsData?.attributes?.[0]?.type as InferEnum<typeof MilestoneTypeEnum>,
        };
      }
    }
    const cleanedData = Object.fromEntries(
      Object.entries(baseData).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );

    logger.info({ cleanedData }, "Cleaned Data Milestone");

    await db.insert(milestones).values(cleanedData).onConflictDoNothing();

    await insertBlock({ event, eventName: "scholarship:MilestoneAdded" });

    logger.info({ id }, " Milestones Created");

  });

  ponder.on("scholarship:WithdrawMilestone", async ({ event }) => {
    const { applicantId, programId } = event.args;

    logger.info({ applicantId, programId }, "Withdraw Milestone Param");

    const [student] = await db
      .select()
      .from(students)
      .where(
        and(
          eq(students.blockchainId, Number(applicantId)),
          eq(programs.blockchainId, Number(programId))
        )
      );

    if (!student) {
      return;
    }

    await db.update(milestones)
      .set({
        isCollected: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(milestones.programId, student.programId!),
          eq(milestones.studentId, student.id)
        )
      );

    await insertBlock({ event, eventName: "scholarship:WithdrawMilestone" });

    logger.info({ applicantId, programId }, " Milestones Withdraw");
  });

  ponder.on("scholarship:SubmitMilestone", async ({ event }) => {
    const { milestoneId, proveCID } = event.args;

    logger.info({ milestoneId, proveCID }, "Submit Milestone Param");


    const [milestone] = await db
      .select()
      .from(milestones)
      .where(eq(milestones.blockchainId, Number(milestoneId)));

    if (!milestone) {
      return;
    }


    await db.update(milestones)
      .set({
        proveCID: proveCID,
        updatedAt: new Date(),
      })
      .where(eq(milestones.id, milestone.id));

    await insertBlock({ event, eventName: "scholarship:SubmitMilestone" });

    logger.info({ milestoneId, proveCID }, " Milestones Submited");
  });

};