/**
 * sync-deployments.mjs
 *
 * Post-deploy script — runs automatically after every v4 Hardhat Ignition deploy.
 * Can also be run standalone after compile to sync ABIs only.
 *
 * What it does:
 *   1. Reads ignition/deployments/<chain>/deployed_addresses.json (if not --abi-only)
 *   2. Extracts contract addresses for ScholarshipV4 module contracts
 *   3. Reads ABI from artifacts/contracts/v4/**\/*.json
 *   4. Writes to:
 *        → packages/ponder/abis/v4/<Contract>.ts        (always)
 *        → packages/ponder/.env  (CONTRACT_* + START_BLOCK)  (deploy mode only)
 *        → packages/frontend/src/constants/contractsV4.ts     (always — ABIs + addresses)
 *
 * Usage (run from packages/contract/):
 *   node scripts/sync-deployments.mjs [chainId]     # full sync (addresses + ABIs)
 *   node scripts/sync-deployments.mjs 4202           # liskSepolia full sync
 *   node scripts/sync-deployments.mjs --abi-only     # ABIs only (no deployment needed)
 *
 * npm scripts (auto-chained):
 *   npm run deploy-v4        → deploy + full sync (localhost)
 *   npm run deploy-v4-lisk   → deploy + full sync (liskSepolia)
 *   npm run compile:sync     → compile + ABI-only sync
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");           // packages/contract
const MONO_ROOT = path.resolve(ROOT, "../..");             // repo root

// ── CLI args ────────────────────────────────────────────────────────────────
const abiOnly = process.argv.includes("--abi-only") || !process.argv[2];
const chainId = process.argv.find(a => /^\d+$/.test(a)) ?? "31337";
const CHAIN_DIR = path.join(ROOT, "ignition", "deployments", `chain-${chainId}`);

// ── Output dirs ─────────────────────────────────────────────────────────────
const PONDER_ABI_DIR = path.resolve(MONO_ROOT, "packages/ponder/abis/v4");
const PONDER_ENV = path.resolve(MONO_ROOT, "packages/ponder/.env");
const PONDER_ENV_LOCAL = path.resolve(MONO_ROOT, "packages/ponder/.env.local");
const FE_CONSTANTS = path.resolve(MONO_ROOT, "packages/frontend/src/constants");

// ── Contract map: Ignition key → short name ──────────────────────────────────
// Key pattern: "<ModuleName>#<ContractName>"
const CONTRACT_MAP = {
  "ScholarshipV4#ScholarshipCore": "ScholarshipCore",
  "ScholarshipV4#ScholarshipTreasury": "ScholarshipTreasury",
  "ScholarshipV4#ScholarshipBounty": "ScholarshipBounty",
  "ScholarshipV4#ScholarshipReputation": "ScholarshipReputation",
  "ScholarshipV4#CommitteeGovernance": "CommitteeGovernance",
  "ScholarshipV4#MockUSDC": "MockUSDC",
};

// Short name → env key (for ponder .env)
const ENV_KEY_MAP = {
  ScholarshipCore: "CONTRACT_CORE",
  ScholarshipTreasury: "CONTRACT_TREASURY",
  ScholarshipBounty: "CONTRACT_BOUNTY",
  ScholarshipReputation: "CONTRACT_REPUTATION",
  CommitteeGovernance: "CONTRACT_COMMITTEE",
  MockUSDC: "CONTRACT_USDC",
};

// ════════════════════════════════════════════════════════════════════════════
// STEP 1 — Read deployed_addresses.json (skipped in ABI-only mode)
// ════════════════════════════════════════════════════════════════════════════

let v4Addresses = {};

if (!abiOnly) {
  const addressFile = path.join(CHAIN_DIR, "deployed_addresses.json");
  if (!fs.existsSync(addressFile)) {
    console.error(`❌  No deployment found at:\n    ${addressFile}`);
    console.error(`    Run "npm run deploy-v4" first, or use --abi-only to sync ABIs only.`);
    process.exit(1);
  }

  const allAddresses = JSON.parse(fs.readFileSync(addressFile, "utf8"));
  console.log(`\n📋  Reading deployment from chain-${chainId}:`);

  for (const [key, address] of Object.entries(allAddresses)) {
    if (CONTRACT_MAP[key]) {
      const name = CONTRACT_MAP[key];
      v4Addresses[name] = address;
      console.log(`    ✅  ${name.padEnd(24)} ${address}`);
    }
  }

  if (Object.keys(v4Addresses).length === 0) {
    console.error("❌  No ScholarshipV4 contracts found in deployment.");
    console.error("    Make sure you ran: npm run deploy-v4");
    process.exit(1);
  }
} else {
  console.log(`\n📋  ABI-only mode — skipping address resolution`);
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 2 — Resolve ABIs from artifacts
// ════════════════════════════════════════════════════════════════════════════

const ARTIFACT_ROOT = path.join(ROOT, "artifacts", "contracts", "v4");

function findArtifact(contractName) {
  // Walk the artifact tree to find <ContractName>.json (skip .dbg.json)
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = walk(full);
        if (found) return found;
      } else if (entry.name === `${contractName}.json`) {
        return full;
      }
    }
    return null;
  }
  return walk(ARTIFACT_ROOT);
}

const abis = {};
for (const name of Object.values(CONTRACT_MAP).filter((n, i, arr) => arr.indexOf(n) === i)) {
  const artifactPath = findArtifact(name);
  if (!artifactPath) {
    console.warn(`    ⚠️   ABI not found for ${name} — skipping`);
    continue;
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  abis[name] = artifact.abi;
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 3 — Write to packages/ponder/abis/v4/
// ════════════════════════════════════════════════════════════════════════════

console.log(`\n📦  Writing ABIs → packages/ponder/abis/v4/`);
fs.mkdirSync(PONDER_ABI_DIR, { recursive: true });

for (const [name, abi] of Object.entries(abis)) {
  // camelCase var name
  const varName = name.charAt(0).toLowerCase() + name.slice(1) + "Abi";
  const fileName = path.join(PONDER_ABI_DIR, `${name}.ts`);
  const content = `// Auto-generated by sync-deployments.mjs — do not edit manually\n` +
    `export const ${varName} = ${JSON.stringify(abi, null, 2)} as const;\n`;
  fs.writeFileSync(fileName, content);
  console.log(`    ✅  ${name}.ts`);
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 4 — Update packages/ponder/.env (skipped in ABI-only mode)
// ════════════════════════════════════════════════════════════════════════════

if (!abiOnly) {
  console.log(`\n🔧  Updating packages/ponder/.env`);

  let envContent = fs.existsSync(PONDER_ENV) ? fs.readFileSync(PONDER_ENV, "utf8") : "";
  let envlocalContent = fs.existsSync(PONDER_ENV_LOCAL) ? fs.readFileSync(PONDER_ENV_LOCAL, "utf8") : "";

  // Get start block from the journal (first block seen in this deployment)
  let startBlock = "0";
  const journalPath = path.join(CHAIN_DIR, "journal.jsonl");
  if (fs.existsSync(journalPath)) {
    const lines = fs.readFileSync(journalPath, "utf8").split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry?.type === "deployment_execution_state_initialize" || entry?.blockNumber) {
          const bn = entry.blockNumber ?? entry?.result?.blockNumber;
          if (bn && Number(bn) > 0) {
            startBlock = String(Number(bn));
            break;
          }
        }
      } catch { /* skip malformed lines */ }
    }
  }

  /**
   * Upsert a key=value pair in the .env content string.
   */
  function upsertEnvVar(content, key, value) {
    const regex = new RegExp(`^(${key}=).*$`, "m");
    if (regex.test(content)) {
      return content.replace(regex, `${key}="${value}"`);
    }
    const sectionMarker = "# V4 CONTRACT ADDRESSES";
    if (content.includes(sectionMarker)) {
      return content.replace(
        new RegExp(`(${sectionMarker}[^\n]*\n)`),
        `$1${key}="${value}"\n`
      );
    }
    return content + `\n${key}="${value}"\n`;
  }

  for (const [name, address] of Object.entries(v4Addresses)) {
    const envKey = ENV_KEY_MAP[name];
    if (!envKey) continue;
    envContent = upsertEnvVar(envContent, envKey, address);
    console.log(`    ✅  ${envKey}=${address}`);
  }

  envContent = upsertEnvVar(envContent, "START_BLOCK", startBlock);
  console.log(`    ✅  START_BLOCK=${startBlock}`);

  fs.writeFileSync(PONDER_ENV, envContent);
  fs.writeFileSync(PONDER_ENV_LOCAL, envContent);
} else {
  console.log(`\n🔧  Skipping ponder .env update (ABI-only mode)`);
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 5 — Write to packages/frontend/src/constants/contractsV4.ts
// ════════════════════════════════════════════════════════════════════════════

console.log(`\n🎨  Writing → packages/frontend/src/constants/contractsV4.ts`);
fs.mkdirSync(FE_CONSTANTS, { recursive: true });

// Build address object (empty if ABI-only)
const hasAddresses = Object.keys(v4Addresses).length > 0;
const addressLines = hasAddresses
  ? Object.entries(v4Addresses)
    .map(([name, addr]) => `  ${name}: "${addr}" as \`0x\${string}\`,`)
    .join("\n")
  : "  // Addresses will be populated after deployment (npm run deploy-v4)";

// Build ABI exports
const abiExports = Object.entries(abis)
  .map(([name, abi]) => {
    const varName = name.charAt(0).toLowerCase() + name.slice(1) + "Abi";
    return `export const ${varName} = ${JSON.stringify(abi, null, 2)} as const;`;
  })
  .join("\n\n");

const feContent = `/**
 * contractsV4.ts
 * Auto-generated by sync-deployments.mjs — do not edit manually.
 * Chain: ${chainId} | Synced: ${new Date().toISOString()}
 */

// ── Deployed Addresses ────────────────────────────────────────────────────────

export const v4Addresses = {
${addressLines}
} as const;

export const v4ChainId = ${chainId};

// ── ABIs ──────────────────────────────────────────────────────────────────────

${abiExports}
`;

fs.writeFileSync(path.join(FE_CONSTANTS, "contractsV4.ts"), feContent);
console.log(`    ✅  contractsV4.ts`);

// ════════════════════════════════════════════════════════════════════════════
// DONE
// ════════════════════════════════════════════════════════════════════════════

const syncedItems = ["Ponder ABIs  → packages/ponder/abis/v4/", "Frontend     → packages/frontend/src/constants/contractsV4.ts"];
if (!abiOnly) syncedItems.unshift("Ponder .env  → packages/ponder/.env");

console.log(`
✨  Sync complete!${abiOnly ? " (ABI-only)" : ""}

${syncedItems.map(s => `   ${s}`).join("\n")}

Next steps:
   1. cd packages/ponder && npm run dev
   2. cd packages/frontend && npm run dev
`);

