import { IPFSMetadata } from "@/types/meta";


export const fetchFromIPFS = async (
  cid: string,
): Promise<IPFSMetadata | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(`${process.env.IPFS_HOST_REQUEST}/ipfs/${cid}`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const raw = await res.json();
    return raw as IPFSMetadata;
  } catch (err) {
    clearTimeout(timeout); // pastikan selalu dibersihkan

    if (err instanceof Error && err.name === "AbortError") {
      console.error("Fetch timeout: IPFS CID mungkin tidak tersedia.");
    } else {
      console.error("Fetch error:", err);
    }

    return null;
  }
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
