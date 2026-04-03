import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Scholarship Protocol v4 — Ignition Deployment Module (FIXED)
 *
 * ROOT CAUSE OF PREVIOUS FAILURES:
 *
 *   All upgradeable contracts (ScholarshipReputation, ScholarshipTreasury,
 *   ScholarshipCore, ScholarshipBounty, CommitteeGovernance) call
 *   `_disableInitializers()` in their constructors — the standard UUPS safety
 *   guard that prevents the implementation contract from being initialised
 *   directly.
 *
 *   The old module deployed them with plain `m.contract(...)` and then called
 *   `m.call(..., "initialize", ...)` on the bare implementation.
 *   That always reverts with `InvalidInitialization()` because initializers
 *   are permanently disabled on the implementation itself.
 *
 * THE FIX — wrap every upgradeable contract in an ERC1967Proxy:
 *
 *   1. Deploy the implementation:
 *        const impl = m.contract("ScholarshipReputation");
 *   2. ABI-encode the `initialize(...)` call:
 *        const initData = encodeFunctionData({ abi, functionName: "initialize", args });
 *      (But Ignition can't import ethers/viem directly, so we use a helper
 *       pattern — see ENCODING NOTE below.)
 *   3. Deploy the proxy:
 *        const proxy = m.contract("ERC1967Proxy", [impl, initData]);
 *   4. Interact with `proxy` address cast as the implementation type.
 *
 * ENCODING NOTE:
 *   Hardhat Ignition supports `m.encodeFunctionCall(contract, "fnName", args)`
 *   as a first-class helper (since @nomicfoundation/hardhat-ignition v0.15+).
 *   This is the idiomatic way to pass init calldata to a proxy constructor
 *   without importing viem or ethers.
 *
 * NON-UPGRADEABLE CONTRACTS (deploy unchanged):
 *   MockUSDC, DonorNFT, StudentNFT — no proxy needed.
 *
 * ROLE WIRING — identical to previous module.
 */

// ── Pre-computed role hashes ──────────────────────────────────────────────
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

const USDC_ADDRESS = process.env.USDC_ADDRESS ?? "";
const PROTOCOL_FEE_RECIPIENT = process.env.PROTOCOL_FEE_RECIPIENT ?? "";

export default buildModule("ScholarshipV4", (m) => {

  const deployer = m.getAccount(0);

  // ════════════════════════════════════════════════════════════════════
  // STEP 1 — USDC  (non-upgradeable, deploy as-is)
  // ════════════════════════════════════════════════════════════════════

  const usdc = USDC_ADDRESS !== ""
    ? m.contractAt("MockUSDC", USDC_ADDRESS)
    : m.contract("MockUSDC");

  // ════════════════════════════════════════════════════════════════════
  // STEP 2 — NFTs  (non-upgradeable, no proxy, no init call)
  // ════════════════════════════════════════════════════════════════════

  const donorNFT = m.contract("DonorNFT");
  const studentNFT = m.contract("StudentNFT");

  // ════════════════════════════════════════════════════════════════════
  // STEP 3 — ScholarshipReputation  (UUPS → needs proxy)
  //
  //   impl constructor: _disableInitializers()  → blocks direct init
  //   fix: deploy impl + ERC1967Proxy(impl, initCalldata)
  // ════════════════════════════════════════════════════════════════════

  const reputationImpl = m.contract("ScholarshipReputation", [], {
    id: "ScholarshipReputation_Impl",
  });

  const reputationInitData = m.encodeFunctionCall(
    reputationImpl,
    "initialize",
    [deployer],
  );

  const reputationProxy = m.contract("ERC1967Proxy", [reputationImpl, reputationInitData], {
    id: "ScholarshipReputation_Proxy",
  });

  // Re-attach the ABI so downstream calls use the typed interface
  const reputation = m.contractAt("ScholarshipReputation", reputationProxy, {
    id: "ScholarshipReputation",
  });

  // ════════════════════════════════════════════════════════════════════
  // STEP 4 — ScholarshipTreasury  (UUPS → needs proxy)
  // ════════════════════════════════════════════════════════════════════

  const feeRecipient = PROTOCOL_FEE_RECIPIENT !== "" ? PROTOCOL_FEE_RECIPIENT : deployer;

  const treasuryImpl = m.contract("ScholarshipTreasury", [], {
    id: "ScholarshipTreasury_Impl",
  });

  const treasuryInitData = m.encodeFunctionCall(
    treasuryImpl,
    "initialize",
    [deployer, usdc, feeRecipient],
  );

  const treasuryProxy = m.contract("ERC1967Proxy", [treasuryImpl, treasuryInitData], {
    id: "ScholarshipTreasury_Proxy",
    after: [reputationProxy], // enforce ordering
  });

  const treasury = m.contractAt("ScholarshipTreasury", treasuryProxy, {
    id: "ScholarshipTreasury",
  });

  // ════════════════════════════════════════════════════════════════════
  // STEP 5 — ScholarshipCore  (UUPS → needs proxy)
  // ════════════════════════════════════════════════════════════════════

  const coreImpl = m.contract("ScholarshipCore", [], {
    id: "ScholarshipCore_Impl",
  });

  const coreInitData = m.encodeFunctionCall(
    coreImpl,
    "initialize",
    [deployer, usdc, treasuryProxy, reputationProxy, donorNFT, studentNFT],
  );

  const coreProxy = m.contract("ERC1967Proxy", [coreImpl, coreInitData], {
    id: "ScholarshipCore_Proxy",
    after: [treasuryProxy],
  });

  const core = m.contractAt("ScholarshipCore", coreProxy, {
    id: "ScholarshipCore",
  });

  // ════════════════════════════════════════════════════════════════════
  // STEP 6 — ScholarshipBounty  (UUPS → needs proxy)
  // ════════════════════════════════════════════════════════════════════

  const bountyImpl = m.contract("ScholarshipBounty", [], {
    id: "ScholarshipBounty_Impl",
  });

  const bountyInitData = m.encodeFunctionCall(
    bountyImpl,
    "initialize",
    [deployer, usdc, coreProxy, treasuryProxy],
  );

  const bountyProxy = m.contract("ERC1967Proxy", [bountyImpl, bountyInitData], {
    id: "ScholarshipBounty_Proxy",
    after: [coreProxy],
  });

  const bounty = m.contractAt("ScholarshipBounty", bountyProxy, {
    id: "ScholarshipBounty",
  });

  // ════════════════════════════════════════════════════════════════════
  // STEP 7 — CommitteeGovernance  (UUPS → needs proxy)
  // ════════════════════════════════════════════════════════════════════

  const committeeImpl = m.contract("CommitteeGovernance", [], {
    id: "CommitteeGovernance_Impl",
  });

  const committeeInitData = m.encodeFunctionCall(
    committeeImpl,
    "initialize",
    [deployer, coreProxy, bountyProxy],
  );

  const committeeProxy = m.contract("ERC1967Proxy", [committeeImpl, committeeInitData], {
    id: "CommitteeGovernance_Proxy",
    after: [bountyProxy],
  });

  const committee = m.contractAt("CommitteeGovernance", committeeProxy, {
    id: "CommitteeGovernance",
  });

  // ════════════════════════════════════════════════════════════════════
  // STEP 8 — WIRE ROLES
  // (identical to before — just using proxy-backed contract refs)
  // ════════════════════════════════════════════════════════════════════

  const afterAll = { after: [committeeProxy] };

  // Treasury: Core moves funds; Bounty slashes & distributes
  m.call(treasury, "grantRole", [ROLES.CORE_ROLE, coreProxy], { id: "treasury_grantCoreRole", ...afterAll });
  m.call(treasury, "grantRole", [ROLES.BOUNTY_ROLE, bountyProxy], { id: "treasury_grantBountyRole", ...afterAll });

  // Core: Bounty freezes/releases/slashes; Committee pushes scores
  m.call(core, "grantRole", [ROLES.BOUNTY_ROLE, bountyProxy], { id: "core_grantBountyRole", ...afterAll });
  m.call(core, "grantRole", [ROLES.COMMITTEE_ROLE, committeeProxy], { id: "core_grantCommitteeRole", ...afterAll });

  // Bounty: Committee resolves disputes
  m.call(bounty, "grantRole", [ROLES.RESOLVER_ROLE, committeeProxy], { id: "bounty_grantResolverRole", ...afterAll });

  // Reputation: Core mints, burns, locks
  m.call(reputation, "grantRole", [ROLES.MINTER_ROLE, coreProxy], { id: "rep_grantMinterRole", ...afterAll });
  m.call(reputation, "grantRole", [ROLES.BURNER_ROLE, coreProxy], { id: "rep_grantBurnerRole", ...afterAll });
  m.call(reputation, "grantRole", [ROLES.LOCKER_ROLE, coreProxy], { id: "rep_grantLockerRole", ...afterAll });

  // NFTs: Core mints on donation and full completion
  m.call(donorNFT, "grantRole", [ROLES.MINTER_ROLE, coreProxy], { id: "donorNFT_grantMinterRole", ...afterAll });
  m.call(studentNFT, "grantRole", [ROLES.MINTER_ROLE, coreProxy], { id: "studentNFT_grantMinterRole", ...afterAll });

  return {
    usdc,
    donorNFT,
    studentNFT,
    reputation,
    treasury,
    core,
    bounty,
    committee,
  };
});