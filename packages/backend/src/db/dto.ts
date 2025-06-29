import { createInsertSchema } from "drizzle-typebox";
import { applicantTable, milestoneTable } from "./schema";

export const applicantInsertDto = createInsertSchema(applicantTable);
export const milestoneInsertDto = createInsertSchema(milestoneTable);