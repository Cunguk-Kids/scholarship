// ══════════════════════════════════════════════════════════════════════════════
// Ponder v4 REST API — Response Types
// Mirrors the Drizzle schema in packages/ponder/src/db/schema.ts
// ══════════════════════════════════════════════════════════════════════════════

// ── Enums ────────────────────────────────────────────────────────────────────

export type ProgramStatus =
  | "CREATED" | "APPLICATION_OPEN" | "SCREENING"
  | "VOTING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type ApplicationStatus =
  | "PENDING_REVIEW" | "SHORTLISTED" | "SCREENED_OUT" | "LOCKED";

export type ScholarStatus =
  | "ACTIVE" | "COMPLETED" | "FROZEN" | "BLACKLISTED";

export type MilestoneStatus =
  | "PENDING" | "SUBMITTED" | "DISPUTED" | "COMPLETED" | "FROZEN";

export type DisputeType =
  | "LIGHT_FRAUD" | "MILESTONE_FRAUD" | "HEAVY_FRAUD";

export type DisputeStatus =
  | "ACTIVE" | "STUDENT_CONCEDED" | "AUTO_GUILTY" | "BH_WON" | "BH_LOST";

// ── Models ───────────────────────────────────────────────────────────────────

export interface Program {
  id: string;
  blockchainId: number;
  initiator: string;
  metadataCID: string;
  status: ProgramStatus;
  educationLevel: number;
  screeningMode: number;
  maxCandidates: number;
  targetWinners: number;
  committeeContract: string;
  totalFund: string;
  allocatedFund: string;
  spentFund: string;
  yieldAccrued: string;
  applicantCount: number;
  shortlistedCount: number;
  activeScholarCount: number;
  applicationStart: string | null;
  applicationEnd: string | null;
  votingStart: string | null;
  votingEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramDetail extends Program {
  _counts: {
    applicants: number;
    scholars: number;
    milestones: number;
    votes: number;
    disputes: number;
  };
}

export interface Applicant {
  id: string;
  programId: string | null;
  blockchainProgramId: number;
  wallet: string;
  status: ApplicationStatus;
  profileCID: string;
  documentCID: string;
  essayCID: string;
  screeningScore: string;
  totalScore: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Scholar {
  id: string;
  programId: string | null;
  blockchainProgramId: number;
  wallet: string;
  status: ScholarStatus;
  freezeUntil: string | null;
  isBlacklisted: boolean;
  currentMilestone: number;
  totalMilestones: number;
  totalReceived: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  blockchainId: number;
  programId: string | null;
  scholarId: string | null;
  scholarWallet: string;
  amount: string;
  proofCID: string;
  status: MilestoneStatus;
  submittedAt: string | null;
  disputeDeadline: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  programId: string | null;
  blockchainProgramId: number;
  voterAddress: string;
  candidateAddress: string;
  votingWeight: string;
  createdAt: string;
}

export interface ConfidenceStake {
  id: string;
  programId: string | null;
  blockchainProgramId: number;
  voterAddress: string;
  scholarAddress: string;
  amount: string;
  isResolved: boolean;
  wasSlashed: boolean;
  returnedAmount: string;
  bonusAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  blockchainId: number;
  programId: string | null;
  milestoneId: number | null;
  scholarAddress: string;
  bountyHunter: string;
  disputeType: DisputeType;
  status: DisputeStatus;
  evidenceCID: string;
  counterEvidenceCID: string;
  stake: string;
  potentialReward: string;
  bhRewardPaid: string;
  raisedAt: string | null;
  defenseDeadline: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reputation {
  id: string;
  address: string;
  repBalance: string;
  totalMinted: string;
  totalBurned: string;
  votingLockedUntil: string | null;
  isVotingLocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  programsCreatedCount: number;
  applicationsCount: number;
  scholarshipsCount: number;
  votesCount: number;
  disputesCount: number;
  committeeProgramsCount: number;
  totalFundReceived: string;
  totalFundCreated: string;
  repBalance: string;
}

export interface DashboardData {
  wallet: string;
  summary: DashboardSummary;
  programsCreated: Program[];
  applications: Array<{ applicant: Applicant; program: Partial<Program> | null }>;
  scholarships: Array<{ scholar: Scholar; program: Partial<Program> | null }>;
  milestones: Milestone[];
  votes: Vote[];
  stakes: ConfidenceStake[];
  disputes: Dispute[];
  reputation: Reputation | null;
  committeePrograms: Program[];
}

export interface AdminOverview {
  totalPrograms: number;
  totalApplicants: number;
  totalScholars: number;
  totalMilestones: number;
  totalDisputes: number;
  totalCreators: number;
}

// ── API Response Wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface SingleResponse<T> {
  data: T;
}

// ── IPFS Metadata (off-chain) ─────────────────────────────────────────────────

export interface ProgramMetadata {
  name: string;
  description: string;
  organization?: string;
  country?: string;
  requirements?: string;
  coverImageCID?: string;
}

export interface ApplicantProfile {
  fullName: string;
  email: string;
  studentId: string;
  bio?: string;
  photoUrl?: string;
}
