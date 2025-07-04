import { donationInsertDto, milestoneInsertDto } from "@/db/dto";
import {
  addDonator, getDonator, getAllDonator
} from "../services/donator.service";
import Elysia from "elysia";

export const donatorController = new Elysia({ prefix: "/milestone" })
  .get("/all", () => {
    return getAllDonator();
  })
  .post(
    "/",
    ({ body }) => {
      return addDonator(body);
    },
    {
      body: donationInsertDto,
    }
  )
  .get("/id/:id", ({ params: { id } }) => {
    return getDonator(id);
  });
