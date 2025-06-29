import { db } from "@/db";
import { applicantInsertDto } from "@/db/dto";
import { applicantTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getApplicant(id: string) {
  return (
    await db.select().from(applicantTable).where(eq(applicantTable.id, id))
  )[0];
}

export async function getAllApplicant() {
  return await db.select().from(applicantTable);
}

export function addApplicant(dto: typeof applicantInsertDto.static) {
  return db.insert(applicantTable).values(dto);
}
