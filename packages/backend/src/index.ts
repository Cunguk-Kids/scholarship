import { Elysia } from "elysia";
import { allController } from "./controllers";
import cors from "@elysiajs/cors";

const elysia = new Elysia()
  .use(
    cors({
      allowedHeaders: "*",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    })
  )
  .use(allController);

elysia.listen(3001, () => console.log("Listening on port 3001"));

export type App = typeof elysia;
