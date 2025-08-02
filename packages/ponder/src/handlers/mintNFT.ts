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

  ponder.on("scholarship:MilestoneAdded", async ({ event }) => {
    try {

    } catch (error) {

    }
  });


};