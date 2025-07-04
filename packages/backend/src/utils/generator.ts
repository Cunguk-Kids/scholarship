import crypto from "crypto";

export function generateProgramId(contractAddress: string, timestamp = new Date().toISOString()) {
  const raw = `${contractAddress}-${timestamp}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
  return { id: hash, timestamp };
}