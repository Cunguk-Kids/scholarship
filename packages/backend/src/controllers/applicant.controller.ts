import { applicantInsertDto } from "@back/db/dto";
import {
  addApplicant,
  getAllApplicant,
  getApplicant,
} from "../services/applicant.service";
import Elysia from "elysia";

export const applicantController = new Elysia({ prefix: "/applicant" })
  .get("/all", () => {
    return getAllApplicant();
  })
  .post(
    "/",
    ({ body }) => {
      return addApplicant(body);
    },
    {
      body: applicantInsertDto,
    }
  )
  .get("/id/:id", ({ params: { id } }) => {
    return getApplicant(id);
  })
