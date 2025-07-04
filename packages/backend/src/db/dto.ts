import { createInsertSchema } from "drizzle-typebox";
import { applicantTable, milestoneTable } from "./schema";
import { t } from "elysia";

export const applicantInsertDto = createInsertSchema(applicantTable);
export const milestoneInsertDto = createInsertSchema(milestoneTable);

export const createProgramDto = t.Object({
  title: t.String(),
  description: t.String(),
});
