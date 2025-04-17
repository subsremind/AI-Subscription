"use client";

import { Card } from "@ui/components/card";
import { MoreVerticalIcon } from "lucide-react"; // 替换ChevronRightIcon
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { EditIcon, Trash2Icon } from "lucide-react";

export function SubscriptionSidebar() {
  const t = useTranslations();
  
  const subscriptionCategories = [
    { id: "1", name: "活跃订阅" },
    { id: "2", name: "已过期" },
    { id: "3", name: "已取消" }
  ];

  return (
    <div className="@container">
      <h2 className="mb-2 font-semibold text-lg">
        {t("subscription.categories.title")}
      </h2>
      <div className="grid gap-2">
        {subscriptionCategories.map((category) => (
          <Card
            key={category.id}
            className="flex cursor-pointer items-center justify-between p-4"
          >
            <span className="font-medium">{category.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreVerticalIcon className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <EditIcon className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
      </div>
    </div>
  );
}