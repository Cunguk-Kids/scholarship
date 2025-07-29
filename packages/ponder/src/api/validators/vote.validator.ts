import { z } from 'zod';

export const voterSchema = z.object({
  programId: z.preprocess((val) => Number(val), z.number()),
  voter: z.string(),
  applicantAddress: z.string(),
});

export type VoterSchemaType = z.infer<typeof voterSchema>;