import { z } from "zod";
import { SubscriptionModel } from "../subscription/types";

// 基础分类Schema
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  subscriptions: z.array(z.lazy(() => SubscriptionModel)).optional()
});

// 创建分类输入Schema
export const CategoryCreateInput = z.object({
  name: z.string().min(1, "分类名称不能为空")
});

// 更新分类输入Schema
export const CategoryUpdateInput = z.object({
  name: z.string().min(1, "分类名称不能为空").optional()
});

// 分类列表响应类型
export type CategoryListResponse = Array<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
}>;

// 导出类型
export type CategoryModel = z.infer<typeof CategorySchema>;
export type CategoryCreateInputType = z.infer<typeof CategoryCreateInput>;
export type CategoryUpdateInputType = z.infer<typeof CategoryUpdateInput>;