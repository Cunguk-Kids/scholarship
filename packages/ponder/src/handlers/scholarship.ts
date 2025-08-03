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
      logger.info({ allocation, creator, id, metadataCID, totalFund, eventName: "Program Param" }, "Program Param");

      //  "openedAt": "1754137548",
      //       "votingAt": "1759190400",
      //       "ongoingAt": "1759363200",
      //       "closedAt": "1759536000"

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
        rules: "",
        startAt: moment().add(2, 'days').format("YYYY-MM-DD"),
        votingAt: moment().add(2, 'days').format("YYYY-MM-DD"),
        ongoingAt: moment().add(2, 'days').format("YYYY-MM-DD"),
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
            startAt: moment.unix(Number(ipfsData?.attributes?.[0]?.openedAt)).format('YYYY-MM-DD HH:mm:ss'),
            votingAt: moment.unix(Number(ipfsData?.attributes?.[0]?.votingAt)).format('YYYY-MM-DD HH:mm:ss'),
            ongoingAt: moment.unix(Number(ipfsData?.attributes?.[0]?.ongoingAt)).format('YYYY-MM-DD HH:mm:ss'),
            endAt: moment.unix(Number(ipfsData?.attributes?.[0]?.closedAt)).format('YYYY-MM-DD HH:mm:ss'),
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

      logger.info({ id, eventName: "scholarship:ProgramCreated" }, "Program Created");
    } catch (error) {

      logger.error({ error }, "Create Program Error");
    }
  });

  ponder.on("scholarship:ApplicantRegistered", async ({ event }) => {
    try {
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


      await db.insert(students).values(cleanedData).onConflictDoUpdate({
        target: [students.studentAddress, students.programId],
        set: cleanedData
      });

      await insertBlock({ event, eventName: "scholarship:ApplicantRegistered" });

      logger.info({ id }, " Student Created");
    } catch (error) {
      logger.info({ error }, " Student Created Error");
    }
  });

  ponder.on("scholarship:OnVoted", async ({ event }) => {
    try {
      const { applicant, programId, voter } = event.args;

      logger.info({ applicant, programId, voter }, " On Voted Param");

      const [program] = await db
        .select()
        .from(programs)
        .where(eq(programs.blockchainId, Number(programId)));

      if (!program) {
        return;
      }


      const [student] = await db
        .select()
        .from(students)
        .where(and(
          eq(students.studentAddress, applicant),
          eq(students.programId, program.id),
        ));

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
    } catch (error) {
      logger.info({ error }, " Voter Created Error");
    }
  });

  ponder.on("scholarship:MilestoneAdded", async ({ event }) => {
    try {
      const { metadataCID, amount, creator, id, programId } = event.args;

      logger.info({ metadataCID, amount, creator, id, programId }, "Milestone Param");

      const [program] = await db
        .select()
        .from(programs)
        .where(eq(programs.blockchainId, Number(programId)));

      if (!program) {
        return;
      }

      let studentRecord = await db
        .select()
        .from(students)
        .where(and(
          eq(students.studentAddress, creator),
          eq(students.programId, program.id)
        ));

      let student = studentRecord[0];

      if (!student) {
        const [insertedStudent] = await db
          .insert(students)
          .values({
            studentAddress: creator,
            programId: program.id,
          })
          .onConflictDoUpdate({
            target: [students.studentAddress, students.programId],
            set: {
              updatedAt: new Date()
            }
          })
          .returning();
        student = insertedStudent;
      }

      const trimmedCID = metadataCID?.replace(/^['"]+|['"]+$/g, '')?.trim();
      let baseData: InferInsertModel<typeof milestones> = {
        amount: Math.round(parseFloat(String(amount)) / 1_000_000),
        blockchainId: Number(id),
        studentId: student?.id!,
        programId: program.id,
        metadataCID: metadataCID,
        description: '',
        estimation: 0,
        type: "Others" as InferEnum<typeof MilestoneTypeEnum>,
        proveCID: "",
        isCollected: false,
      };

      if (trimmedCID && trimmedCID !== "''" && isValidCID(trimmedCID)) {
        logger.info({ trimmedCID }, "CID Data Milestone");
        const ipfsData = await fetchFromIPFS(trimmedCID);
        logger.info({ ipfsData }, "IPFS Data Milestone");

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

      logger.info({ cleanedData, baseData }, "Cleaned Data Milestone");

      await db.insert(milestones).values(cleanedData).onConflictDoNothing();

      await insertBlock({ event, eventName: "scholarship:MilestoneAdded" });

      logger.info({ id }, " Milestones Created");
    } catch (error) {
      logger.error({ error }, "Create Milestone Error");
    }
  });

  ponder.on("scholarship:WithdrawMilestone", async ({ event }) => {
    try {
      const { applicantId, programId } = event.args;

      logger.info({ applicantId, programId }, "Withdraw Milestone Param");

      const [program] = await db
        .select()
        .from(programs)
        .where(eq(programs.blockchainId, Number(programId)));

      if (!program) {
        return;
      }

      const [student] = await db
        .select()
        .from(students)
        .where(
          and(
            eq(students.blockchainId, Number(applicantId)),
            eq(students.programId, program.id)
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
    } catch (error) {
      logger.error({ error }, "Milestones Withdraw Error");
    }
  });

  ponder.on("scholarship:SubmitMilestone", async ({ event }) => {
    try {
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
    } catch (error) {
      logger.error({ error }, "Milestones Submited Error");
    }
  });

};