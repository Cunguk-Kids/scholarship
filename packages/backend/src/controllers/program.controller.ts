import { generateMetadataDto, programInsertDto } from "@back/db/dto";
import Elysia from "elysia";
import {
  addProgram,
  generateMetadataService,
  getAllProgram,
  getProgram,
} from "@back/services/program.service";

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
  .post(
    "/gen",
    ({ body }) => {
      return generateMetadataService(body);
    },
    { body: generateMetadataDto }
  )
  .get("/id/:id", ({ params: { id } }) => {
    return getProgram(id);
  });
