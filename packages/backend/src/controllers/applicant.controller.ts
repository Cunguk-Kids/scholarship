import { applicantCreateDto, milestoneInsertDto } from "@back/db/dto";
import {
  addApplicant,
  getAllApplicant,
  getApplicant,
} from "../services/applicant.service";
import Elysia, { t } from "elysia";
import { db } from "@back/db";
import { applicantTable, milestoneTable } from "@back/db/schema";
import { eq } from "drizzle-orm";

export const applicantController = new Elysia({ prefix: "/applicant" })
  .get("/all", () => {
    return getAllApplicant();
  })
  .get("/milestones/:id", ({ params: { id } }) => {
    return db
      .select()
      .from(milestoneTable)
      .where(eq(milestoneTable.applicantId, id));
  })
  .post(
    "/new",
    async ({ body }) => {
      db.transaction(async (tx) => {
        const applicant = (
          await tx.insert(applicantTable).values(body.applicant).returning()
        )[0];

        if (!applicant) throw new Error("Failed to add applicant");

        await tx.insert(milestoneTable).values(
          body.milestones.map((m, index) => ({
            id:
              `${body.contractId}_${applicant.batch}_` +
              body.nextMilestoneId +
              index +
              "", // id must format batch_id
            programId: applicant.programId,
            applicantId: applicant.id,
            batch: applicant.batch,
            price: m.price,
            metadata: m.metadata,
            type: m.type,
            title: m.title,
          }))
        );
      });
    },
    {
      body: applicantCreateDto,
    }
  )
  .patch(
    "/milestones/:id",
    ({ body, params }) => {
      return db
        .update(milestoneTable)
        .set(body)
        .where(eq(milestoneTable.applicantId, params.id))
        .returning();
    },
    {
      body: t.Required(t.Pick(milestoneInsertDto, ["proveMetadata", "review"])),
    }
  )
  .get("/id/:id", ({ params: { id } }) => {
    return getApplicant(id);
  });
