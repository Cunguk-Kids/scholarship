import { milestoneInsertDto } from "@back/db/dto";
import {
  addMilestoneTemplate,
  getAllMilestoneTemplate,
  getMilestoneTemplate
} from "../services/milestone.template.service";
import Elysia from "elysia";

export const milestoneTemplateController = new Elysia({ prefix: "/milestone" })
  .get("/all", () => {
    return getAllMilestoneTemplate();
  })
  .post(
    "/",
    ({ body }) => {
      return addMilestoneTemplate(body);
    },
    {
      body: milestoneInsertDto,
    }
  )
  .get("/id/:id", ({ params: { id } }) => {
    return getMilestoneTemplate(id);
  });
