import { parseAbi } from "viem";

export const programCreatedEvent = parseAbi([
  "event ProgramCreated(uint256 indexed id, address programContract, address indexed initiator, string programMetadataCID, address targetApplicant, uint256 startDate, uint256 endDate)",
])[0];

export const voteCastedEvent = parseAbi([
  "event vote()",
])[0];