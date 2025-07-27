import { ZodSchema } from "zod";

/**
 * Fetch JSON from IPFS and optionally validate it with a Zod schema.
 *
 * @param cid - IPFS content ID (CID)
 * @param schema - Optional Zod schema for validation
 * @returns Parsed data (typed if schema is provided)
 */
export const fetchFromIPFS = async <T = unknown>(
  cid: string,
  schema?: ZodSchema<T>
): Promise<T> => {
  const res = await fetch(`https://ipfs.io/ipfs/${cid}`);
  if (!res.ok) throw new Error(`Failed to fetch IPFS: ${cid}`);

  const raw = await res.json();

  if (schema) {
    return schema.parse(raw);
  }

  return raw as T;
};
