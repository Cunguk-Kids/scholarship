import { createInsertSchema } from "drizzle-typebox";
import { applicantTable, milestoneTable, milestoneTemplateTable, programTable, donationTable, } from "./schema";

export const applicantInsertDto = createInsertSchema(applicantTable);
export const milestoneInsertDto = createInsertSchema(milestoneTable);
export const milestoneTemplateInsertDto = createInsertSchema(milestoneTemplateTable);
export const donationInsertDto = createInsertSchema(donationTable);
export const programInsertDto = createInsertSchema(programTable);