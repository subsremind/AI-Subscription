import { z } from "zod";

export const SubscriptionModel = z.object({
  id: z.string(),
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
  paymentMethod: z.string().max(30),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
  notesIncluded: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const SubscriptionCreateInput = SubscriptionModel.omit({ 
  id: true,
  createdAt: true,
  updatedAt: true 
});

export const SubscriptionUpdateInput = SubscriptionCreateInput.partial();

export type Subscription = z.infer<typeof SubscriptionModel>;
export type SubscriptionCreateInput = z.infer<typeof SubscriptionCreateInput>;
export type SubscriptionUpdateInput = z.infer<typeof SubscriptionUpdateInput>;

