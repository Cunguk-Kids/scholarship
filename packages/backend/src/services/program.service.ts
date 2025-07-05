import { db } from "@back/db";
import { programTable } from "@back/db/schema";
import type { generateMetadataDto, programInsertDto } from "@back/db/dto";
import { pinata } from "@back/lib/pinata";

//  `${process.env.IPFS_URL}/${(await pinata.upload.public.json(metadata)).cid}`,
export async function getProgram(id: string) {
  return db.query.programTable.findFirst({
    where: (program, { eq }) => eq(program.id, id),
    with: {
      milestoneTemplates: true,
      donations: true,
    },
  });
}

export async function getAllProgram() {
  return await db.select().from(programTable);
}

export function addProgram(dto: typeof programInsertDto.static) {
  return db.insert(programTable).values(dto);
}

export async function generateMetadataService({
  description,
  title,
}: typeof generateMetadataDto.static) {
  const metadata = {
    title,
    description,
  };
  return {
    metadata,
    url: `${process.env.IPFS_URL}/${(await pinata.upload.public.json(metadata)).cid}`,
  };
}
