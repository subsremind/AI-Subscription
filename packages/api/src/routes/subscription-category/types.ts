import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  organizationId: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});


export const CategoryCreateInput = z.object({
  name: z.string().min(1, "Category name is required"),
  organizationId: z.string().optional(),
});


export const CategoryUpdateInput = z.object({
  name: z.string().min(1, "Category name is required").optional(),
  organizationId: z.string().nullable().optional(),
});


export type CategoryListResponse = Array<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
}>;

export type CategoryModel = z.infer<typeof CategorySchema>;
export type CategoryCreateInputType = z.infer<typeof CategoryCreateInput>;
export type CategoryUpdateInputType = z.infer<typeof CategoryUpdateInput>;