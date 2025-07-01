import { Elysia } from "elysia";
import { applicantController } from "./applicant.controller";
import { milestoneController } from "./milestone.controller";
import { studentNFTController } from "./studentNFT.controller";
import { investorNFTController } from "./investorNFT.controller";

export const allController = new Elysia({ prefix: "/v1" })
  .use(applicantController)
  .use(milestoneController)
  .use(studentNFTController)
  .use(investorNFTController);
