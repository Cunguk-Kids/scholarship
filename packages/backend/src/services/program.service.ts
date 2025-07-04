import type { createProgramDto } from "@back/db/dto";
import { pinata } from "@back/lib/pinata";

export async function createProgramService({
  description,
  title,
}: typeof createProgramDto.static) {
  const metadata = {
    title,
    description,
  };
  return {
    metadata,
    url: `${process.env.IPFS_URL}/${(await pinata.upload.public.json(metadata)).cid}`,
  };
}