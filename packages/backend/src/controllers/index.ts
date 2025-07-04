import { Elysia } from "elysia";
import { applicantController } from "./applicant.controller";
import { milestoneController } from "./milestone.controller";
import { studentNFTController } from "./studentNFT.controller";
import { investorNFTController } from "./investorNFT.controller";
import { programController } from "./program.controller";
import { milestoneTemplateController } from "./milestone.template.controller";

export const allController = new Elysia({ prefix: "/v1" })
  .use(applicantController)
  .use(milestoneController)
  .use(studentNFTController)
  .use(programController)
  .use(milestoneTemplateController)
  .use(investorNFTController)
  .use(programController);
