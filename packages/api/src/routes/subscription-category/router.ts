import { db } from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { z } from "zod";
import { validator } from "hono-openapi/zod";
import { adminMiddleware } from "../../middleware/admin";


import { 
  CategorySchema,
  CategoryCreateInput,
  CategoryUpdateInput
} from "./types";

export const subscriptionCategoryRouter = new Hono()
  .basePath("/subscription-categories")
  .use(adminMiddleware)
  .onError((err, c) => {
    console.error('Error in subscriptionCategoryRouter:', err);
    return c.json({ success: false, error: err.message }, 500);
  })
  .get(
    "/",
    describeRoute({
      summary: "Get all subscription categories",
      tags: ["SubscriptionCategory"],
    }),
    async (c) => {
      const categories = await db.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { subscriptions: true }
          }
        }
      });
      return c.json(CategorySchema.array().parse(categories));
    }
  )
  .post(
    "/",
    validator("json", CategoryCreateInput),
    describeRoute({
      summary: "Create new subscription category",
      tags: ["SubscriptionCategory"],
    }),
    async (c) => {
      const { name } = c.req.valid("json");
      const category = await db.category.create({
        data: { name }
      });
      return c.json(category, 201);
    }
  )
  .patch(
    "/:id",
    validator("json", CategoryUpdateInput),
    describeRoute({
      summary: "Update subscription category",
      tags: ["SubscriptionCategory"],
    }),
    async (c) => {
      const id = c.req.param("id");
      const { name } = c.req.valid("json");
      
      const category = await db.category.update({
        where: { id },
        data: { name }
      });
      return c.json(category);
    }
  )
  .delete(
    "/:id",
    describeRoute({
      summary: "Delete subscription category",
      tags: ["SubscriptionCategory"],
    }),
    async (c) => {
      const id = c.req.param("id");
      await db.category.delete({ where: { id } });
      return c.json({ success: true });
    }
  );