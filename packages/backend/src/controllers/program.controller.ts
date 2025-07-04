import { createProgramDto } from "@back/db/dto";
import { createProgramService } from "@back/services/program.service";
import Elysia from "elysia";

export const programController = new Elysia({ prefix: "/program" }).post(
  "/",
  ({ body }) => {
    return createProgramService(body);
  },
  { body: createProgramDto }
);
