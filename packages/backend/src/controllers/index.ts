import { Elysia } from "elysia";
import { applicantController } from "./applicant.controller";
import { milestoneController } from "./milestone.controller";

export const allController = new Elysia({ prefix: "/v1" })
  .use(applicantController)
  .use(milestoneController);
