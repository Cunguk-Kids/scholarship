import { z } from 'zod';

export const faucetSchema = z.object({
  address: z.string(),
});

export type faucetSchemaType = z.infer<typeof faucetSchema>;