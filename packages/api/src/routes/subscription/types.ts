import { z } from "zod";

export const SubscriptionStatusSchema = z.enum([
  "active",
  "canceled",
  "expired",
  "paused"
]);

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
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type SubscriptionCreateInput = z.infer<typeof SubscriptionCreateInput>;
export type SubscriptionUpdateInput = z.infer<typeof SubscriptionUpdateInput>;

export const SubscriptionPlanVariantModel = z.object({
	id: z.string(),
	price: z.number(),
	currency: z.string(),
	interval: z.string(),
	interval_count: z.number(),
});

export const SubscriptionPlanModel = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable().optional(),
	storeId: z.string().nullable().optional(),
	variants: z.array(SubscriptionPlanVariantModel),
});

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanModel>;
export type SubscriptionPlanVariant = z.infer<
	typeof SubscriptionPlanVariantModel
>;
