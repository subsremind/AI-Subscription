import { db } from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { z } from "zod";
import { validator } from "hono-openapi/zod";
import { nanoid } from "nanoid";


import { 
  SubscriptionModel,
  SubscriptionCreateInput,
  SubscriptionUpdateInput
} from "./types";
import { adminMiddleware } from "../../middleware/admin";

export const subscriptionRouter = new Hono()
  .basePath("/subscriptions")
  .use(adminMiddleware)
  // Add global error handling
  .onError((err, c) => {
    console.error('Error in subscriptionRouter:', err);
    return c.json({ success: false, error: err.message, details: err  }, 500);
  })
  .get(
    "/",
    validator(
      "query",
      z.object({
        query: z.string().optional(),
        categoryId: z.string().optional(),
        limit: z.string().optional().default("10").transform(Number),
        offset: z.string().optional().default("0").transform(Number),
      })
    ),
    describeRoute({
      summary: "Get all subscriptions",
      tags: ["Subscription"],
    }),
    async (c) => {
      const { query, categoryId, limit, offset } = c.req.valid("query");

      const subscriptions = await db.subscription.findMany({
        where: {
          company: { contains: query, mode: "insensitive" },
          ...(categoryId ? { categoryId } : {}),
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
        const rawData = c.req.valid("json");

        const { tags = [], categoryId, ...cleanRawData } = rawData;

        const subscriptionTags = tags.map(tagId => ({
          tagId: tagId, 
        }));
        console.log('Received subscriptionTags:', subscriptionTags);
        
        const data = {
          ...cleanRawData,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: {connect: {id: categoryId}},
          subscriptionTags: subscriptionTags.length > 0 
                  ? { create: subscriptionTags }
                  : undefined
        };

          console.log('Received data:', data);
          const subscription = await db.subscription.create({data});
          console.log('Created subscription:', subscription);
          return c.json(subscription, 201);
        } catch (e) {
          // console.error('Create subscription error:', e);
          return c.json({ 
            error: 'Failed to create subscription',
            details: e.message || e.toString() 
          }, 400);
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
      
      const existing = await db.subscription.findUnique({ where: { id } });
      if (!existing) {
        return c.json({ error: "Subscription not found" }, 404);
      }
  
      const subscription = await db.subscription.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
      });
      return c.json(subscription);
    }
  )
  .put(
    "/:id",
    validator("json", SubscriptionCreateInput),
    describeRoute({
      summary: "Replace subscription",
      tags: ["Subscription"],
    }),
    async (c) => {
      const id = c.req.param("id");
      const rawData = c.req.valid("json");
  
      const existing = await db.subscription.findUnique({ where: { id } });
      if (!existing) {
        return c.json({ error: "Subscription not found" }, 404);
      }
  
      const { tags = [], categoryId, ...cleanRawData } = rawData;
      const subscriptionTags = tags.map(tagId => ({ tagId }));
  
      const subscription = await db.subscription.update({
        where: { id },
        data: {
          ...cleanRawData,
          updatedAt: new Date(),
          category: { connect: { id: categoryId } },
          subscriptionTags: {
            deleteMany: {}, // 先删除所有现有标签
            create: subscriptionTags // 再添加新标签
          }
        },
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

