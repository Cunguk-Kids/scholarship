import { Elysia } from "elysia";
import { applicantController } from "./applicant.controller";
import { milestoneController } from "./milestone.controller";
import { studentNFTController } from "./studentNFT.controller";

export const allController = new Elysia({ prefix: "/v1" })
  .use(applicantController)
  .use(milestoneController)
  .use(studentNFTController);
