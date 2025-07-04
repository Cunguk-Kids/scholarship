import { db } from "@/db";
import { programInsertDto } from "@/db/dto";
import { programTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProgram(id: string) {
  return (
    await db.select().from(programTable).where(eq(programTable.id, id))
  )[0];
}

export async function getAllProgram() {
  return await db.select().from(programTable);
}

export function addProgram(dto: typeof programInsertDto.static) {
  return db.insert(programTable).values(dto);
}
