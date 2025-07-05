import { db } from "@back/db";
import { milestoneTemplateInsertDto } from "@back/db/dto";
import { milestoneTemplateTable } from "@back/db/schema";
import { eq } from "drizzle-orm";

export async function getMilestoneTemplate(id: string) {
  return (
    await db.select().from(milestoneTemplateTable).where(eq(milestoneTemplateTable.id, id))
  )[0];
}

export async function getAllMilestoneTemplate() {
  return await db.select().from(milestoneTemplateTable);
}

export function addMilestoneTemplate(dto: typeof milestoneTemplateInsertDto.static) {
  return db.insert(milestoneTemplateTable).values(dto);
}
