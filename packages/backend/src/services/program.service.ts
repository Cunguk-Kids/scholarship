import { db } from "@/db";
import { programInsertDto } from "@/db/dto";
import { programTable } from "@/db/schema";

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
