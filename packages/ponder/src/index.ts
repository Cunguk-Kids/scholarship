import {
  scholarshipCoreHandlers,
  scholarshipTreasuryHandlers,
  scholarshipBountyHandlers,
  scholarshipReputationHandlers,
} from "./handlers/scholarship-v4";

export const setupHandlers = () => {
  // v4 handlers — one per contract
  scholarshipCoreHandlers();
  scholarshipTreasuryHandlers();
  scholarshipBountyHandlers();
  scholarshipReputationHandlers();
};
