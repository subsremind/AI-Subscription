"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/table";
import { Button } from "@ui/components/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@shared/components/Spinner";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/components/dropdown-menu";
import { MoreVerticalIcon, EditIcon, Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/components/dialog"
import { SubscriptionForm } from "./SubscriptionForm";
import { useState } from "react";

export function SubscriptionTable() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false); // 添加这行
  
  // 获取订阅列表
  const { data, isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions");
      const { subscriptions } = await response.json();
      return subscriptions;
    },
  });

  // 删除订阅
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("删除失败");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success(t("common.status.success"));
    },
    onError: () => {
      toast.error(t("common.status.error"));
    }
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "company",
      header: "公司/服务名称",
    },
    {
      accessorKey: "value",
      header: "金额",
      cell: ({ row }) => (
        <span>
          {row.original.value ? 
            `${row.original.value} ${row.original.currency}` : 
            'N/A'}
        </span>
      ),
    },
    {
      accessorKey: "cycle",
      header: "周期",
      cell: ({ row }) => (
        <span>
          {row.original.frequency} {row.original.cycle}
        </span>
      ),
    },
    {
      accessorKey: "nextPaymentDate",
      header: "下次付款日期",
    },
    {
      accessorKey: "paymentMethod",
      header: "付款方式",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <EditIcon className="mr-2 size-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => deleteMutation.mutate(row.original.id)}
            >
              <Trash2Icon className="mr-2 size-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">订阅管理</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>{t("common.actions.new")}</Button>
          </DialogTrigger>
          <DialogContent 
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>{t("common.actions.new")}</DialogTitle>
            </DialogHeader>
            <SubscriptionForm 
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner className="mr-2 size-4 text-primary" />
          {t("common.loading")}
        </div>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}