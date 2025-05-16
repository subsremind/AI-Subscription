import { db } from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { validator } from "hono-openapi/zod";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth";

export const subscriptionAlertRouter = new Hono()
	.basePath("/subscription-alert")
	.use(authMiddleware)
	.get(
		"/",
		describeRoute({
			summary: "Get all subscription alerts",
			tags: ["SubscriptionAlert"],
		}),
		validator(
			"query",
			z.object({ subscriptionId: z.string().optional() }).optional(),
		),
		async (c) => {
			const query = c.req.valid("query") || {};
			const alerts = await db.subscriptionAlert.findMany({
				where: query?.subscriptionId
					? { subscriptionId: query.subscriptionId }
					: {},
			});
			return c.json(alerts);
		},
	)
	.post(
		"/",
		describeRoute({
			summary: "Create new subscription alert",
			tags: ["SubscriptionAlert"],
		}),
		validator(
			"json",
			z.object({
				subscriptionId: z.string(),
				message: z.string(),
				date: z.string().datetime(),
			}),
		),
		async (c) => {
			const data = c.req.valid("json");
			const alert = await db.subscriptionAlert.create({
				data: {
					...data,
					userId: c.get("user").id,
				},
			});
			return c.json(alert, 201);
		},
	)
	.patch(
		"/",
		describeRoute({
			summary: "Update or create multiple subscription alerts in bulk",
			tags: ["SubscriptionAlert"],
		}),
		validator(
			"json",
			z.object({
				subscriptionId: z.string(), // 必填的 subscriptionId
				alertList: z.array(
					z.object({
						id: z.string().optional(),
						intervalValue: z.number(),
						intervalUnit: z.string(),
						onField: z.string(),
						contact: z.string(),
					}),
				),
			}),
		),
		async (c) => {
			const { subscriptionId, alertList } = c.req.valid("json");
			const userId = c.get("user").id;

			const results = [];
			let existingAlerts = [];

			// 如果 alertList 是空数组，直接删除所有相关记录
			if (alertList.length === 0) {
				await db.subscriptionAlert.deleteMany({
					where: {
						subscriptionId,
					},
				});
				return c.json({
					success: true,
					results: [],
					count: 0,
				});
			}

			// 查询现有记录
			existingAlerts = await db.subscriptionAlert.findMany({
				where: {
					subscriptionId,
				},
			});

			// 获取提交的 alertList 中的所有 id
			const submittedAlertIds = new Set(
				alertList.map((d) => d.id).filter(Boolean),
			);

			// 检查现有记录中哪些需要删除（即在 alertList 中不存在的记录）
			const alertsToDelete = existingAlerts.filter(
				(alert) => !submittedAlertIds.has(alert.id),
			);

			if (alertsToDelete.length > 0) {
				// 删除不需要的记录
				await db.subscriptionAlert.deleteMany({
					where: {
						id: {
							in: alertsToDelete.map((alert) => alert.id),
						},
					},
				});
			}

			// 处理每个 alert
			for (const data of alertList) {
				if (data.id) {
					// 情况1: 正常更新
					const updated = await db.subscriptionAlert.update({
						where: { id: data.id },
						data: {
							...data,
							intervalValue: Number(data.intervalValue),
							userId,
						},
					});
					results.push(updated);
				} else {
					const created = await db.subscriptionAlert.create({
						data: {
							...data,
							subscriptionId, // 确保 subscriptionId 被正确设置
							intervalValue: Number(data.intervalValue),
							userId,
						},
					});
					results.push(created);
				}
			}
			return c.json({
				success: true,
				results,
				count: results.length,
			});
		},
	)
	.delete(
		"/:id",
		describeRoute({
			summary: "Delete subscription alert",
			tags: ["SubscriptionAlert"],
		}),
		async (c) => {
			const id = c.req.param("id");
			await db.subscriptionAlert.delete({ where: { id } });
			return c.json({ success: true });
		},
	);
