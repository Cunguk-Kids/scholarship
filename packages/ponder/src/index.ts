import {
  scholarshipCoreHandlers,
  scholarshipTreasuryHandlers,
  scholarshipBountyHandlers,
  scholarshipReputationHandlers,
  committeeGovernanceHandlers,
  milestoneManagerHandlers,
} from "./handlers/scholarship-v4";

scholarshipCoreHandlers();
scholarshipTreasuryHandlers();
scholarshipBountyHandlers();
scholarshipReputationHandlers();
committeeGovernanceHandlers();
milestoneManagerHandlers();
