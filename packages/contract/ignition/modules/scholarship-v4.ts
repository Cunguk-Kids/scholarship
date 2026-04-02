import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toHex } from "viem";

/**
 * Scholarship Protocol v4 — Ignition Deployment Module
 *
 * Deploy order (dependency chain):
 *   1. ScholarshipReputation   ← no deps
 *   2. DonorNFT                ← no deps
 *   3. StudentNFT              ← no deps
 *   4. ScholarshipTreasury     ← needs: USDC address
 *   5. ScholarshipCore         ← needs: USDC, Treasury, Reputation, DonorNFT, StudentNFT
 *   6. ScholarshipBounty       ← needs: USDC, Core, Treasury
 *   7. CommitteeGovernance     ← needs: Core, Bounty
 *
 * After deploy, roles are wired:
 *   Treasury:   CORE_ROLE   → Core
 *               BOUNTY_ROLE → Bounty
 *   Core:       BOUNTY_ROLE     → Bounty
 *               COMMITTEE_ROLE  → CommitteeGovernance
 *   Bounty:     RESOLVER_ROLE   → CommitteeGovernance
 *   Reputation: MINTER_ROLE → Core
 *               BURNER_ROLE → Core
 *               LOCKER_ROLE → Core
 *   DonorNFT:   MINTER_ROLE → Core
 *   StudentNFT: MINTER_ROLE → Core
 *
 * USDC Address:
 *   • localhost / ganache: deploy a MockUSDC
 *   • liskSepolia: set USDC_ADDRESS in .env or override the parameter below
 *
 * Protocol Fee Recipient:
 *   • Set PROTOCOL_FEE_RECIPIENT in .env, defaults to deployer wallet
 */

// ── Configurable parameters ───────────────────────────────────────────
// Override these via ignition parameters or .env before deploying to mainnet.
const USDC_ADDRESS = process.env.USDC_ADDRESS ?? "";
const PROTOCOL_FEE_RECIPIENT = process.env.PROTOCOL_FEE_RECIPIENT ?? "";

export default buildModule("ScholarshipV4", (m) => {
  // ── Deployer (used as initial admin until multisig is set) ───────────
  const deployer = m.getAccount(0);
  const feeRecipient = PROTOCOL_FEE_RECIPIENT !== ""
    ? PROTOCOL_FEE_RECIPIENT
    : deployer;

  // ── Role constants (keccak256 of role name strings) ──────────────────
  const UPGRADER_ROLE = keccak256(toHex("UPGRADER_ROLE"));
  const CORE_ROLE = keccak256(toHex("CORE_ROLE"));
  const BOUNTY_ROLE = keccak256(toHex("BOUNTY_ROLE"));
  const COMMITTEE_ROLE = keccak256(toHex("COMMITTEE_ROLE"));
  const RESOLVER_ROLE = keccak256(toHex("RESOLVER_ROLE"));
  const MINTER_ROLE = keccak256(toHex("MINTER_ROLE"));
  const BURNER_ROLE = keccak256(toHex("BURNER_ROLE"));
  const LOCKER_ROLE = keccak256(toHex("LOCKER_ROLE"));

  // ════════════════════════════════════════════════════════════════
  // STEP 1 — USDC (MockUSDC on local; real address on testnet/mainnet)
  // ════════════════════════════════════════════════════════════════

  const usdc = USDC_ADDRESS !== ""
    ? m.contractAt("MockUSDC", USDC_ADDRESS as `0x${string}`)
    : m.contract("MockUSDC"); // MockUSDC only deployed on local/test networks

  // ════════════════════════════════════════════════════════════════
  // STEP 2 — TOKEN CONTRACTS (non-upgradeable)
  // ════════════════════════════════════════════════════════════════

  const reputation = m.contract("ScholarshipReputation");
  const donorNFT = m.contract("DonorNFT");
  const studentNFT = m.contract("StudentNFT");

  // ════════════════════════════════════════════════════════════════
  // STEP 3 — INITIALIZE REPUTATION (UUPS proxy pattern: deploy → initialize)
  // ════════════════════════════════════════════════════════════════

  const reputationInit = m.call(reputation, "initialize", [deployer], {
    id: "reputationInit",
  });

  // ════════════════════════════════════════════════════════════════
  // STEP 4 — TREASURY
  // ════════════════════════════════════════════════════════════════

  const treasury = m.contract("ScholarshipTreasury");
  const treasuryInit = m.call(treasury, "initialize", [deployer, usdc, feeRecipient], {
    id: "treasuryInit",
    after: [reputationInit],
  });

  // ════════════════════════════════════════════════════════════════
  // STEP 5 — CORE
  // ════════════════════════════════════════════════════════════════

  const core = m.contract("ScholarshipCore");
  const coreInit = m.call(core, "initialize", [
    deployer,
    usdc,
    treasury,
    reputation,
    donorNFT,
    studentNFT,
  ], {
    id: "coreInit",
    after: [treasuryInit],
  });

  // ════════════════════════════════════════════════════════════════
  // STEP 6 — BOUNTY
  // ════════════════════════════════════════════════════════════════

  const bounty = m.contract("ScholarshipBounty");
  const bountyInit = m.call(bounty, "initialize", [deployer, usdc, core, treasury], {
    id: "bountyInit",
    after: [coreInit],
  });

  // ════════════════════════════════════════════════════════════════
  // STEP 7 — COMMITTEE GOVERNANCE
  // ════════════════════════════════════════════════════════════════

  const committee = m.contract("CommitteeGovernance");
  const committeeInit = m.call(committee, "initialize", [deployer, core, bounty], {
    id: "committeeInit",
    after: [bountyInit],
  });

  // ════════════════════════════════════════════════════════════════
  // STEP 8 — WIRE ROLES
  // All role grants wait for all inits to complete.
  // ════════════════════════════════════════════════════════════════

  const afterAll = { after: [committeeInit] };

  // -- Treasury roles --------------------------------------------------
  // Core may move funds; Bounty may slash and distribute
  m.call(treasury, "grantRole", [CORE_ROLE, core], { id: "treasury_grantCoreRole", ...afterAll });
  m.call(treasury, "grantRole", [BOUNTY_ROLE, bounty], { id: "treasury_grantBountyRole", ...afterAll });

  // -- Core roles ------------------------------------------------------
  // Bounty may freeze/release milestones and slash scholars
  // CommitteeGovernance may push averaged screening scores
  m.call(core, "grantRole", [BOUNTY_ROLE, bounty], { id: "core_grantBountyRole", ...afterAll });
  m.call(core, "grantRole", [COMMITTEE_ROLE, committee], { id: "core_grantCommitteeRole", ...afterAll });

  // -- Bounty roles ----------------------------------------------------
  // CommitteeGovernance may call resolveDispute()
  m.call(bounty, "grantRole", [RESOLVER_ROLE, committee], { id: "bounty_grantResolverRole", ...afterAll });

  // -- Reputation roles ------------------------------------------------
  // Core mints REP on milestones, burns on fraud, locks on disputes
  m.call(reputation, "grantRole", [MINTER_ROLE, core], { id: "rep_grantMinterRole", ...afterAll });
  m.call(reputation, "grantRole", [BURNER_ROLE, core], { id: "rep_grantBurnerRole", ...afterAll });
  m.call(reputation, "grantRole", [LOCKER_ROLE, core], { id: "rep_grantLockerRole", ...afterAll });

  // -- NFT mint roles --------------------------------------------------
  // Core mints DonorNFT on donation and StudentNFT on programme completion
  m.call(donorNFT, "grantRole", [MINTER_ROLE, core], { id: "donorNFT_grantMinterRole", ...afterAll });
  m.call(studentNFT, "grantRole", [MINTER_ROLE, core], { id: "studentNFT_grantMinterRole", ...afterAll });

  // ════════════════════════════════════════════════════════════════
  // RETURN all deployed contracts for Ignition to record addresses
  // ════════════════════════════════════════════════════════════════

  return {
    usdc,
    reputation,
    donorNFT,
    studentNFT,
    treasury,
    core,
    bounty,
    committee,
  };
});
