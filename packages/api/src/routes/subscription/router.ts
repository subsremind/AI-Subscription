import { db } from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { z } from "zod";
import { validator } from "hono-openapi/zod";


import { 
  SubscriptionModel,
  SubscriptionCreateInput,
  SubscriptionUpdateInput
} from "./types";
import { adminMiddleware } from "../../middleware/admin";

export const subscriptionRouter = new Hono()
  .basePath("/subscriptions")
  .use(adminMiddleware)
  .get(
    "/",
    validator(
      "query",
      z.object({
        query: z.string().optional(),
        limit: z.string().optional().default("10").transform(Number),
        offset: z.string().optional().default("0").transform(Number),
      })
    ),
    describeRoute({
      summary: "Get all subscriptions",
      tags: ["Subscription"],
    }),
    async (c) => {
      const { query, limit, offset } = c.req.valid("query");

      const subscriptions = await db.subscription.findMany({
        where: {
          company: { contains: query, mode: "insensitive" },
        },
        include: {
          category: true,
          tags: true
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      });

      const total = await db.subscription.count();

      return c.json({ subscriptions, total });
    }
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
          tags: true
        }
      });

      if (!subscription) {
        return c.json({ error: "Subscription not found" }, 404);
      }

      return c.json(subscription);
    }
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
        const data = c.req.valid("json");
        
        // 业务逻辑验证示例
        if (data.cycle === "Yearly" && data.frequency > 1) {
          return c.json({ error: "Yearly subscriptions cannot have frequency > 1" }, 400);
        }

        const subscription = await db.subscription.create({ data });
        return c.json(subscription, 201);
      } catch (error) {
        return c.json({ error: "Failed to create subscription" }, 400);
      }
    }
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
      const subscription = await db.subscription.update({
        where: { id },
        data,
      });
      return c.json(subscription);
    }
  )
  .delete(
    "/:id",
    describeRoute({
      summary: "Delete subscription",
      tags: ["Subscription"],
    }),
    async (c) => {
      const id = c.req.param("id");
      await db.subscription.delete({ where: { id } });
      return c.json({ success: true });
    }
  );

