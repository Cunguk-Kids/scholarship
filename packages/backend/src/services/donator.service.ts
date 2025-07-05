import { db } from "@back/db";
import { donationInsertDto } from "@back/db/dto";
import { donationTable } from "@back/db/schema";
import { eq } from "drizzle-orm";

export async function getDonator(id: string) {
  return (
    await db.select().from(donationTable).where(eq(donationTable.id, id))
  )[0];
}

export async function getAllDonator() {
  return await db.select().from(donationTable);
}

export function addDonator(dto: typeof donationInsertDto.static) {
  return db.insert(donationTable).values(dto);
}
