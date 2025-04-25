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
import { useTranslations, useLocale } from "next-intl";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/components/dialog"
import { PlusIcon } from "lucide-react";
import { SubscriptionForm } from "./SubscriptionForm";
import { useState } from "react";
import { formatCurrency } from "@saas/utils/currency";
import { formatDateWithTimezone } from "@saas/utils/timezone";

export function SubscriptionTable({ categoryId, organizationId }: { categoryId?: string; organizationId?: string }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null); // New edit state
  
  // Get subscription list
  const { data, isLoading } = useQuery({
    queryKey: ["subscription", categoryId, organizationId],
    queryFn: async () => {
      let url = '/api/subscription';
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (organizationId) params.append('organizationId', organizationId);
      url += `?${params.toString()}`;
      const response = await fetch(url);
      return await response.json(); // Directly return the array from API
    },
  });

  // Delete subscription
  const [deleteSubscriptionId, setDeleteSubscriptionId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/subscription/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-categories'] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success(t("common.status.success"));
      setDeleteSubscriptionId(null);
    },
    onError: () => {
      toast.error(t("common.status.error"));
    }
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "value",
      header: "Amount",
      cell: ({ row }) => (
        <span>
          {row.original.value ? 
            formatCurrency(row.original.value, row.original.currency) : 
            'N/A'}
        </span>
      ),
    },
    {
      accessorKey: "cycle",
      header: "Billing Cycle",
      cell: ({ row }) => (
        <span>
          {row.original.frequency} {row.original.cycle}
        </span>
      ),
    },
    {
      accessorKey: "nextPaymentDate",
      header: "Next Payment Date",
      cell: ({ row }) => (
        <span>
          {row.original.nextPaymentDate ? 
            formatDateWithTimezone(row.original.nextPaymentDate) : 
            'N/A'}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
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
            <DropdownMenuItem onClick={() => {
              setEditingSubscription(row.original);
              setOpen(true); // Add this line to open dialog
            }}>
              <EditIcon className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => setDeleteSubscriptionId(row.original.id)}
            >
              <Trash2Icon className="mr-2 size-4" />
              Delete
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
        <h2 className="text-xl font-bold">Subscription Management</h2>
        <Dialog 
          open={open} 
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setEditingSubscription(null); // Reset edit state when closing dialog
          }}
        >
          <DialogTrigger asChild>
            <Button variant="ghost"  onClick={() => setEditingSubscription(null)}>
              <PlusIcon className="size-4" />{t("common.actions.new")}
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="w-[45rem] !max-w-[45vw]"
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? t("common.actions.edit") : t("common.actions.new")}
              </DialogTitle>
            </DialogHeader>
            <SubscriptionForm 
              subscription={editingSubscription}
              categoryId={categoryId}
              organizationId={organizationId}
              onSuccess={() => {
                setOpen(false);
                setEditingSubscription(null);
              }}
            />
          </DialogContent>
        </Dialog>

      <Dialog open={!!deleteSubscriptionId} onOpenChange={(open) => !open && setDeleteSubscriptionId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Are you sure you want to delete this subscription?</p>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setDeleteSubscriptionId(null)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => deleteSubscriptionId && deleteMutation.mutate(deleteSubscriptionId)}
              >
                Confirm
              </Button>
            </div>
          </div>
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
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}