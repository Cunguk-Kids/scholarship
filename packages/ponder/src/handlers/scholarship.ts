import { ponder } from "ponder:registry";
import schema from "ponder:schema";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { fetchFromIPFS } from "../utils/ipfs";
import { logger } from "@/utils/logger";
export const scholarship = () => {

  ponder.on("scholarship:ProgramCreated", async ({ event }) => {
    const { allocation, creator, id, metadataCID, totalFund } = event.args;

    logger.info({
      event: "ProgramCreated",
      programId: id.toString(),
      creator,
      totalFund,
      allocation,
      metadataCID
    }, "📦 ProgramCreated received");

    // const ipfsData = await fetchFromIPFS(metadataCID);

    await db.insert(programs).values(
      [{
        milestoneType: Number(allocation) == 0 ? "FIXED" : "USER_DEFINED",
        creator: String(creator),
        programId: Number(id),
        totalFund: Number(totalFund),
        metadataCID: metadataCID
      }]
    );
  });

  ponder.on("scholarship:ApplicantRegistered", async ({ event }) => {
    const { applicantAddress, programId, id } = event.args;

    // await db.insert(programs).values({

    // });
  });

  ponder.on("scholarship:ApproveMilestone", async ({ event }) => {
    const { milestoneId, } = event.args;

    // await db.insert(programs).values({

    // });
  });

  ponder.on("scholarship:OnVoted", async ({ event }) => {
    const { applicant, programId, voter } = event.args;

    // await db.insert(programs).values({

    // });
  });

  ponder.on("scholarship:WithdrawMilestone", async ({ event }) => {
    const { applicantId, programId } = event.args;

    // await db.insert(programs).values({

    // });
  });

  ponder.on("scholarship:SubmitMilestone", async ({ event }) => {
    const { milestoneId, proveCID } = event.args;

    // await db.insert(programs).values({

    // });
  });

};