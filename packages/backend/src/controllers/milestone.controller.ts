import { milestoneInsertDto } from "@back/db/dto";
import {
  addMilestone,
  getAllMilestone,
  getMilestone,
} from "../services/milestone.service";
import Elysia from "elysia";

export const milestoneController = new Elysia({ prefix: "/milestone" })
  .get("/all", () => {
    return getAllMilestone();
  })
  .get("/id/:id", ({ params: { id } }) => {
    return getMilestone(id);
  });
