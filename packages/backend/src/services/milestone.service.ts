import { db } from "@back/db";
import { milestoneInsertDto } from "@back/db/dto";
import { milestoneTable } from "@back/db/schema";
import { eq } from "drizzle-orm";

export async function getMilestone(id: string) {
  return (
    await db.select().from(milestoneTable).where(eq(milestoneTable.id, id))
  )[0];
}

export async function getAllMilestone() {
  return await db.select().from(milestoneTable);
}

export function addMilestone(dto: typeof milestoneInsertDto.static) {
  return db.insert(milestoneTable).values(dto);
}
