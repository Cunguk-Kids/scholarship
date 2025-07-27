import { hc } from "hono/client";
import type { AppType } from "../../../ponder/src/api/index";

export const client = hc<AppType>("http://localhost:42069");
