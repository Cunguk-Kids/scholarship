import { IPFSMetadata } from "@/types/meta";

export const fetchFromIPFS = async (
  cid: string,
): Promise<IPFSMetadata> => {
  const res = await fetch(`https://camping-programmes-annex-gorgeous.trycloudflare.com/ipfs/${cid}`);
  if (!res.ok) throw new Error(`Failed to fetch IPFS: ${cid}`);

  const raw = await res.json();

  return raw as IPFSMetadata;
};

const cidRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[afkz][1-9a-zA-Z]{48,})$/;

export function cleanCID(raw: string | undefined | null): string {
  if (!raw) return '';
  return raw.trim().replace(/^'+|'+$/g, '');
}

export function isValidCID(cid: string | undefined | null): boolean {
  const clean = cleanCID(cid);
  return cidRegex.test(clean);
}
