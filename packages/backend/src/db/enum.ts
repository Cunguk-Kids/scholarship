import { pgEnum } from "drizzle-orm/pg-core";

export const scholarshipStatusEnum = pgEnum("scholarship_status", [
  "Pending",
  "OpenForApplications",
  "DonationClose",
  "VotingOpen",
  "Completed",
]);
export const milestoneType = pgEnum("milestone_type", [
  "TEMPLATE",
  "CUSTOM",
]);