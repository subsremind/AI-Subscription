import { db } from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { validator } from "hono-openapi/zod";
import { z } from "zod";
import { verifyOrganizationMembership } from "../organizations/lib/membership";

import { utcnow } from "@repo/utils";
import { authMiddleware } from "../../middleware/auth";
import { SubscriptionCreateInput, SubscriptionUpdateInput } from "./types";

export const subscriptionRouter = new Hono()
	.basePath("/subscription")
	.use(authMiddleware)
	.get(
		"/",
		validator(
			"query",
			z.object({
				query: z.string().optional(),
				categoryId: z.string().optional(),
				organizationId: z.string().optional(),
			}),
		),
		describeRoute({
			summary: "Get all subscriptions",
			tags: ["Subscription"],
		}),
		async (c) => {
			const { query, categoryId, organizationId } = c.req.valid("query");

			const subscriptions = await db.subscription.findMany({
				where: {
					company: { contains: query, mode: "insensitive" },
					...(categoryId ? { categoryId } : {}),
					...(organizationId
						? { organizationId }
						: {
								userId: c.get("user").id,
								organizationId: null,
							}),
				},
				orderBy: { createdAt: "desc" },
			});

			return c.json(subscriptions);
		},
	)
	.get(
		"/:id",
		describeRoute({
			summary: "Get subscription by ID",
			tags: ["Subscription"],
		}),
		async (c) => {
			const id = c.req.param("id");
			const subscription = await db.subscription.findUnique({
				where: { id },
				include: {
					category: true,
					tags: true,
				},
			});

			if (!subscription) {
				return c.json({ error: "Subscription not found" }, 404);
			}

			return c.json(subscription);
		},
	)
	.post(
		"/count",
		validator(
			"query",
			z.object({
				organizationId: z.string().optional(),
			}),
		),
		describeRoute({
			summary: "Get all subscriptions count",
			tags: ["Subscription"],
		}),
		async (c) => {
			const { organizationId } = c.req.valid("query");
			const count = await db.subscription.count({
				where: {
					...(organizationId
						? { organizationId }
						: {
								userId: c.get("user").id,
								organizationId: null,
							}),
				},
			});
			return c.json({ count: count });
		},
	)
	.post(
		"/",
		validator("json", SubscriptionCreateInput),
		describeRoute({
			summary: "Create new subscription",
			tags: ["Subscription"],
		}),
		async (c) => {
			try {
				const rawData = c.req.valid("json");
				const user = c.get("user");
				const {
					tags = [],
					categoryId,
					organizationId,
					...cleanRawData
				} = rawData;

				if (organizationId) {
					await verifyOrganizationMembership(organizationId, user.id);
				}

				const subscriptionTags = tags.map((tagId) => ({
					tagId: tagId,
				}));

				const data = {
					...cleanRawData,
					organization: organizationId
						? { connect: { id: organizationId } }
						: undefined,
					user: { connect: { id: user.id } },
					category: categoryId
						? { connect: { id: categoryId } }
						: undefined,
					subscriptionTags:
						subscriptionTags.length > 0
							? { create: subscriptionTags }
							: undefined,
				};

				const subscription = await db.subscription.create({ data });
				return c.json(subscription, 201);
			} catch (e) {
				return c.json(
					{
						error: "Failed to create subscription",
						details: e.message || e.toString(),
					},
					400,
				);
			}
		},
	)
	.patch(
		"/:id",
		validator("json", SubscriptionUpdateInput),
		describeRoute({
			summary: "Update subscription",
			tags: ["Subscription"],
		}),
		async (c) => {
			const id = c.req.param("id");
			const data = c.req.valid("json");

			const user = c.get("user");
			if (data.organizationId) {
				await verifyOrganizationMembership(
					data.organizationId,
					user.id,
				);
			}

			const existing = await db.subscription.findUnique({
				where: { id },
			});
			if (!existing) {
				return c.json({ error: "Subscription not found" }, 404);
			}

			const subscription = await db.subscription.update({
				where: { id },
				data: {
					...data,
					updatedAt: utcnow(),
				},
			});

			return c.json(subscription);
		},
	)
	.put(
		"/:id",
		validator("json", SubscriptionCreateInput),
		describeRoute({
			summary: "Replace subscription",
			tags: ["Subscription"],
		}),
		async (c) => {
			try {
				const id = c.req.param("id");
				const rawData = c.req.valid("json");
				const user = c.get("user");

				const existing = await db.subscription.findUnique({
					where: { id },
				});
				if (!existing) {
					return c.json({ error: "Subscription not found" }, 404);
				}

				const { tags = [], ...cleanRawData } = rawData;
				const subscriptionTags = tags.map((tagId) => ({ tagId }));

				const subscription = await db.subscription.update({
					where: {
						id,
					},
					data: {
						...cleanRawData,
						updatedAt: utcnow(),
						categoryId:
							rawData.categoryId === ""
								? null
								: rawData.categoryId,
						subscriptionTags: {
							deleteMany: {},
							create: subscriptionTags,
						},
					},
				});

				const changes = [];
				const fieldsToCompare = [
					"company",
					"description",
					"frequency",
					"value",
					"currency",
					"cycle",
					"type",
					"recurring",
					"categoryId",
					"contractExpiry",
					"nextPaymentDate",
					"urlLink",
					"notesIncluded",
				];

				for (const field of fieldsToCompare) {
					if (
						String(existing[field]) !== String(subscription[field])
					) {
						changes.push({
							field,
							fromValue: String(existing[field]),
							toValue: String(subscription[field]),
						});
					}
				}

				if (changes.length > 0) {
					await Promise.all(
						changes.map(async (change) => {
							await db.editHistory.create({
								data: {
									createdBy: user.name,
									tableName: "subscription",
									tableField: change.field,
									tableId: id,
									fromValue: change.fromValue,
									toValue: change.toValue,
								},
							});
						}),
					);
				}

				return c.json(subscription);
			} catch (e) {
				return c.json(
					{
						error: "Failed to update subscription",
						details: e.message || e.toString(),
					},
					400,
				);
			}
		},
	)
	.delete(
		"/:id",
		describeRoute({
			summary: "Delete subscription",
			tags: ["Subscription"],
		}),
		async (c) => {
			const id = c.req.param("id");
			await db.subscription.delete({
				where: {
					id,
				},
			});
			return c.json({ success: true });
		},
	);
