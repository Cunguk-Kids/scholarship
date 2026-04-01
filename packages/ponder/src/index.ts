import { scholarship } from "./handlers/scholarship";
import {
  scholarshipCoreHandlers,
  scholarshipTreasuryHandlers,
  scholarshipBountyHandlers,
  scholarshipReputationHandlers,
} from "./handlers/scholarship-v4";

export const setupHandlers = () => {
  // Legacy v1/v2 handler (kept for backward compatibility)
  scholarship();

  // v4 handlers — one per contract
  scholarshipCoreHandlers();
  scholarshipTreasuryHandlers();
  scholarshipBountyHandlers();
  scholarshipReputationHandlers();
};
