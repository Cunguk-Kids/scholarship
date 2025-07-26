import { pgEnum } from "drizzle-orm/pg-core";

export const MilestoneAllocationEnum = pgEnum("milestone_allocation_type", [
  "FIXED",
  "USER_DEFINED",
]);

export const MilestoneTypeEnum = pgEnum("milestone_type", [
  "Tuition",
  "Equipment",
  "Living_Cost",
  "Project",
  "Others",
]);

