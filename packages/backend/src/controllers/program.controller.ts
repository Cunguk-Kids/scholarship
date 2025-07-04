import { programInsertDto } from "@/db/dto";
import Elysia from "elysia";
import { addProgram, getAllProgram, getProgram } from "@back/services/program.service";

export const programController = new Elysia({ prefix: "/program" })
  .get("/all", () => {
    return getAllProgram();
  })
  .post(
    "/",
    ({ body }) => {
      return addProgram(body);
    },
    {
      body: programInsertDto,
    }
  )
  .get("/id/:id", ({ params: { id } }) => {
    return getProgram(id);
  });