import { createInsertSchema } from "drizzle-typebox";
import { applicantTable, milestoneTable, programTable } from "./schema";

export const applicantInsertDto = createInsertSchema(applicantTable);
export const milestoneInsertDto = createInsertSchema(milestoneTable);
export const programInsertDto = createInsertSchema(programTable);