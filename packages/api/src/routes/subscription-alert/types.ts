import { z } from "zod";

export const SubscriptionAlertCreateInput = z.object({
	subscriptionId: z.string(),
	intervalValue: z.number(),
	intervalUnit: z.string(),
	onField: z.string(),
	contact: z.string(),
});

export const SubscriptionAlertUpdateInput = z.object({
	id: z.string(),
	subscriptionId: z.string(),
	intervalValue: z.number(),
	intervalUnit: z.string(),
	onField: z.string(),
	contact: z.string(),
	userId: z.string().nullable(),
	createdAt: z.date(),
});

export const SubscriptionAlertSchema = z.object({
	id: z.string(),
	subscriptionId: z.string(),
	subscription: z.object({ id: z.string() }),
	intervalValue: z.number(),
	intervalUnit: z.string(),
	onField: z.string(),
	contact: z.string(),
	userId: z.string().nullable(),
	user: z.object({ id: z.string() }).nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	subscriptionAlertRecords: z.array(z.object({ id: z.string() })),
});
