import { z } from 'zod';

const AmountTypeSchema = z.enum(['FIXED', 'USER_DEFINED']);

export const applicantSchema = z.object({
  fullName: z.string().min(2, 'Required'),
  email: z.string().optional(),
  studentId: z.string().min(1, 'Required'),
  milestones: z
    .array(
      z.object({
        type: z.string().optional(),
        description: z.string().min(1, 'Required'),
        amount: z.string().min(1, 'Required'),
      })
    )
    .min(1, 'At least one milestone'),
});

export const providerSchema = z.object({
  scholarshipName: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  deadline: z.string().min(1, 'Required'),
  recipientCount: z.string().refine((val) => Number(val) > 0, 'Must be > 0'),
  totalFund: z.string().min(1, 'Required'),
  distributionMethod: z.string().optional(),
  selectionMethod: AmountTypeSchema,
});

export type AmountType = z.infer<typeof AmountTypeSchema>;
