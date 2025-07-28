import { hc } from "hono/client";
import type { AppType } from "../../../ponder/src/api/index";

export const client = hc<AppType>("http://139.59.232.68:42069");
