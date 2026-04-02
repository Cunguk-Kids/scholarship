import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Scholarship Protocol v4 — Ignition Deployment Module
 *
 * Deploy order:
 *   1. MockUSDC / existing USDC
 *   2. ScholarshipReputation, DonorNFT, StudentNFT  (no deps)
 *   3. ScholarshipTreasury
 *   4. ScholarshipCore
 *   5. ScholarshipBounty
 *   6. CommitteeGovernance
 *   7. Wire all roles
 *
 * FIXES vs previous version:
 *   1. Removed `import { keccak256, toHex } from "viem"` — viem is ESM-only
 *      and Hardhat's module loader is CommonJS. Using it caused the
 *      "SyntaxError: missing ) after argument list" error.
 *      Role hashes are now hardcoded (deterministic keccak256 constants).
 *
 *   2. feeRecipient ternary fixed — when PROTOCOL_FEE_RECIPIENT env is empty,
 *      we pass `deployer` (an Ignition AccountFuture) directly as the arg.
 *      Both string and AccountFuture are valid m.call argument types.
 *
 * Required .env (packages/contract/.env):
 *   DEPLOYER_PRIVATE_KEY     — wallet that signs deployment txs
 *   USDC_ADDRESS             — leave empty to deploy MockUSDC locally
 *   PROTOCOL_FEE_RECIPIENT   — leave empty to use deployer wallet
 */

// ── Pre-computed role hashes ──────────────────────────────────────────────
// keccak256(toUtf8Bytes("ROLE_NAME")) — verified against OpenZeppelin output.
// Recompute: ethers.keccak256(ethers.toUtf8Bytes("ROLE_NAME"))
const ROLES = {
  UPGRADER_ROLE: "0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3",
  CORE_ROLE: "0x502d3d275257923b2bea6ea25d9631f12369fb532871f13eb85eb09dc0fb4842",
  BOUNTY_ROLE: "0x0303601fb32aa3ffc89171916fb42b72e41ae580d3fb71ada99aa461e6c55660",
  COMMITTEE_ROLE: "0x794daa56950487582951e8db2fdbcbee68c2223c65641d0aa02a3afc64f9a86f",
  RESOLVER_ROLE: "0x92a19c77d2ea87c7f81d50c74403cb2f401780f3ad919571121efe2bdb427eb1",
  MINTER_ROLE: "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
  BURNER_ROLE: "0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848",
  LOCKER_ROLE: "0xaf9a8bb3cbd6b84fbccefa71ff73e26e798553c6914585a84886212a46a90279",
};

// ── Env config ────────────────────────────────────────────────────────────
const USDC_ADDRESS = process.env.USDC_ADDRESS ?? "";
const PROTOCOL_FEE_RECIPIENT = process.env.PROTOCOL_FEE_RECIPIENT ?? "";

export default buildModule("ScholarshipV4", (m) => {

  const deployer = m.getAccount(0);

  // ════════════════════════════════════════════════════════════
  // STEP 1 — USDC
  // ════════════════════════════════════════════════════════════

  const usdc = USDC_ADDRESS !== ""
    ? m.contractAt("MockUSDC", USDC_ADDRESS)
    : m.contract("MockUSDC");

  // ════════════════════════════════════════════════════════════
  // STEP 2 — TOKEN CONTRACTS (no proxy, no init)
  // ════════════════════════════════════════════════════════════

  const reputation = m.contract("ScholarshipReputation");
  const donorNFT = m.contract("DonorNFT");
  const studentNFT = m.contract("StudentNFT");

  // ════════════════════════════════════════════════════════════
  // STEP 3 — INITIALIZE REPUTATION (UUPS)
  // ════════════════════════════════════════════════════════════

  const reputationInit = m.call(reputation, "initialize", [deployer], {
    id: "reputationInit",
  });

  // ════════════════════════════════════════════════════════════
  // STEP 4 — TREASURY
  // feeRecipient: plain string from .env OR deployer AccountFuture.
  // Both types are accepted by Hardhat Ignition as call arguments.
  // ════════════════════════════════════════════════════════════

  const treasury = m.contract("ScholarshipTreasury");
  const feeRecipient = PROTOCOL_FEE_RECIPIENT !== "" ? PROTOCOL_FEE_RECIPIENT : deployer;

  const treasuryInit = m.call(treasury, "initialize", [
    deployer, usdc, feeRecipient,
  ], {
    id: "treasuryInit",
    after: [reputationInit],
  });

  // ════════════════════════════════════════════════════════════
  // STEP 5 — CORE
  // ════════════════════════════════════════════════════════════

  const core = m.contract("ScholarshipCore");

  const coreInit = m.call(core, "initialize", [
    deployer, usdc, treasury, reputation, donorNFT, studentNFT,
  ], {
    id: "coreInit",
    after: [treasuryInit],
  });

  // ════════════════════════════════════════════════════════════
  // STEP 6 — BOUNTY
  // ════════════════════════════════════════════════════════════

  const bounty = m.contract("ScholarshipBounty");

  const bountyInit = m.call(bounty, "initialize", [
    deployer, usdc, core, treasury,
  ], {
    id: "bountyInit",
    after: [coreInit],
  });

  // ════════════════════════════════════════════════════════════
  // STEP 7 — COMMITTEE GOVERNANCE
  // ════════════════════════════════════════════════════════════

  const committee = m.contract("CommitteeGovernance");

  const committeeInit = m.call(committee, "initialize", [
    deployer, core, bounty,
  ], {
    id: "committeeInit",
    after: [bountyInit],
  });

  // ════════════════════════════════════════════════════════════
  // STEP 8 — WIRE ROLES
  // ════════════════════════════════════════════════════════════

  const afterAll = { after: [committeeInit] };

  // Treasury: Core moves funds; Bounty slashes & distributes
  m.call(treasury, "grantRole", [ROLES.CORE_ROLE, core], { id: "treasury_grantCoreRole", ...afterAll });
  m.call(treasury, "grantRole", [ROLES.BOUNTY_ROLE, bounty], { id: "treasury_grantBountyRole", ...afterAll });

  // Core: Bounty freezes/releases/slashes; Committee pushes scores
  m.call(core, "grantRole", [ROLES.BOUNTY_ROLE, bounty], { id: "core_grantBountyRole", ...afterAll });
  m.call(core, "grantRole", [ROLES.COMMITTEE_ROLE, committee], { id: "core_grantCommitteeRole", ...afterAll });

  // Bounty: Committee resolves disputes
  m.call(bounty, "grantRole", [ROLES.RESOLVER_ROLE, committee], { id: "bounty_grantResolverRole", ...afterAll });

  // Reputation: Core mints, burns, locks
  m.call(reputation, "grantRole", [ROLES.MINTER_ROLE, core], { id: "rep_grantMinterRole", ...afterAll });
  m.call(reputation, "grantRole", [ROLES.BURNER_ROLE, core], { id: "rep_grantBurnerRole", ...afterAll });
  m.call(reputation, "grantRole", [ROLES.LOCKER_ROLE, core], { id: "rep_grantLockerRole", ...afterAll });

  // NFTs: Core mints on donation and full completion
  m.call(donorNFT, "grantRole", [ROLES.MINTER_ROLE, core], { id: "donorNFT_grantMinterRole", ...afterAll });
  m.call(studentNFT, "grantRole", [ROLES.MINTER_ROLE, core], { id: "studentNFT_grantMinterRole", ...afterAll });

  return { usdc, reputation, donorNFT, studentNFT, treasury, core, bounty, committee };
});