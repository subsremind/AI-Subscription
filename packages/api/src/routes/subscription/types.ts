import { z } from "zod";

export const SubscriptionModel = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string().nullable(),
  company: z.string(),
  description: z.string().optional(),
  frequency: z.number(),
  value: z.number().optional(),
  currency: z.string().length(3),
  cycle: z.enum(["Daily", "Weekly", "Monthly", "Yearly"]),
  type: z.string().max(30),
  recurring: z.boolean(),
  nextPaymentDate: z.string().datetime().optional(),
  contractExpiry: z.string().datetime().optional(),
  urlLink: z.string().url(),
  paymentMethod: z.string().max(30).optional(),
  categoryId: z.string().nullable(),
  notes: z.string().optional(),
  notesIncluded: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const SubscriptionCreateInput = z.object({
  company: z.string(),
  description: z.string(),
  frequency: z.number(),
  value: z.number(),
  currency: z.string(),
  cycle: z.string(),
  type: z.string(),
  recurring: z.boolean(),
  urlLink: z.string(),
  paymentMethod: z.string().nullable().default(null).optional(),
  categoryId: z.string().nullable(),
  notes: z.string().optional(),
  notesIncluded: z.boolean().optional(),
  nextPaymentDate: z.string().datetime().optional(),
  contractExpiry: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  organizationId: z.string().optional(),
});

export const SubscriptionUpdateInput = SubscriptionCreateInput.partial();

export type Subscription = z.infer<typeof SubscriptionModel>;
export type SubscriptionCreateInput = z.infer<typeof SubscriptionCreateInput>;
export type SubscriptionUpdateInput = z.infer<typeof SubscriptionUpdateInput>;

