import { db } from "@/db";
import { programInsertDto } from "@/db/dto";
import { programTable } from "@/db/schema";

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
// import type { createProgramDto } from "@back/db/dto";
// import { pinata } from "@back/lib/pinata";

// export async function createProgramService({
//   description,
//   title,
// }: typeof createProgramDto.static) {
//   const metadata = {
//     title,
//     description,
//   };
//   return {
//     metadata,
//     url: `${process.env.IPFS_URL}/${(await pinata.upload.public.json(metadata)).cid}`,
//   };
// }
