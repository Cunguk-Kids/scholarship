import { createProgramDto, programInsertDto } from "@back/db/dto";
import Elysia from "elysia";
import { addProgram, createProgramService, getAllProgram, getProgram } from "@back/services/program.service";

export const programController = new Elysia({ prefix: "/program" })
  .get("/all", () => {
    return getAllProgram();
  })
  .post(
    "/new-program",
    ({ body }) => {
      return addProgram(body);
    },
    {
      body: programInsertDto,
    }
  ).post(
    "/",
    ({ body }) => {
      return createProgramService(body);
    },
    { body: createProgramDto }
  )
  .get("/id/:id", ({ params: { id } }) => {
    return getProgram(id);
  });