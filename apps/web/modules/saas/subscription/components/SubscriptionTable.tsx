"use client";

import { formatCurrency } from "@saas/utils/currency";
import { formatDateWithTimezone } from "@saas/utils/timezone";
import { Spinner } from "@shared/components/Spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@ui/components/table";
import {
	BellPlus,
	EditIcon,
	MoreVerticalIcon,
	PlusIcon,
	Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AlertSubscriptionDialog } from "./AlertSubscriptionDialog";
import { DeleteSubscriptionDialog } from "./DeleteSubscriptionDialog";
import { EditSubscriptionDialog } from "./EditSubscriptionDialog";

export function SubscriptionTable({
	categoryId,
	organizationId,
}: { categoryId?: string; organizationId?: string }) {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [editOpen, setEditOpen] = useState<boolean>(false);
	const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
	const [subscription, setSubscription] = useState<any | null>(null);

	const onEditSuccess = (open: boolean, isReload: boolean) => {
		setEditOpen(open);
		if (isReload) {
			reload();
		}
	};

	const onAlertOpenChange = (newOpen: boolean) => {
		setAlertOpen(newOpen);
	};

	const onDeleteSuccess = (open: boolean, isReload: boolean) => {
		setDeleteOpen(open);
		if (isReload) {
			reload();
		}
	};

	const reload = () => {
		queryClient.invalidateQueries({
			queryKey: ["subscription-categories"],
		});
		queryClient.invalidateQueries({
			queryKey: ["total-subscriptions"],
		});
		queryClient.invalidateQueries({ queryKey: ["subscription"] });
	};

	const { data, isLoading } = useQuery({
		queryKey: ["subscription", categoryId, organizationId],
		queryFn: async () => {
			let url = "/api/subscription";
			const params = new URLSearchParams();
			if (categoryId) {
				params.append("categoryId", categoryId);
			}
			if (organizationId) {
				params.append("organizationId", organizationId);
			}
			url += `?${params.toString()}`;
			const response = await fetch(url);
			return await response.json(); // Directly return the array from API
		},
	});

	const columns: ColumnDef<any>[] = [
		{
			accessorKey: "company",
			header: t("subscription.table.columns.company"),
		},
		{
			accessorKey: "value",
			header: t("subscription.table.columns.amount"),
			cell: ({ row }) => (
				<span>
					{row.original.value
						? formatCurrency(
								row.original.value,
								row.original.currency,
							)
						: "N/A"}
				</span>
			),
		},
		{
			accessorKey: "cycle",
			header: t("subscription.table.columns.billingCycle"),
			cell: ({ row }) => (
				<span>
					{row.original.frequency} {row.original.cycle}
				</span>
			),
		},
		{
			accessorKey: "nextPaymentDate",
			header: t("subscription.table.columns.nextPaymentDate"),
			cell: ({ row }) => (
				<span>
					{row.original.nextPaymentDate
						? formatDateWithTimezone(row.original.nextPaymentDate)
						: "N/A"}
				</span>
			),
		},
		{
			accessorKey: "paymentMethod",
			header: t("subscription.table.columns.paymentMethod"),
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
						<DropdownMenuItem
							onClick={() => {
								setAlertOpen(true);
								setSubscription(row.original);
							}}
						>
							<BellPlus className="mr-2 size-4" />
							{t("subscription.table.actions.alert")}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								setEditOpen(true);
								setSubscription(row.original);
							}}
						>
							<EditIcon className="mr-2 size-4" />
							{t("subscription.table.actions.edit")}
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => {
								setDeleteOpen(true);
								setSubscription(row.original);
							}}
						>
							<Trash2Icon className="mr-2 size-4" />
							{t("subscription.table.actions.delete")}
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
				<h2 className="text-xl font-bold">{t("subscription.table.title")}</h2>
				<Button
					variant="ghost"
					onClick={() => {
						setEditOpen(true);
						setSubscription(null);
					}}
				>
					<PlusIcon className="size-4" />
					{t("common.actions.new")}
				</Button>
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
											header.getContext(),
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
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{t("common.table.empty")}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			)}
			<EditSubscriptionDialog
				open={editOpen}
				categoryId={categoryId}
				organizationId={organizationId}
				subscription={subscription}
				onSuccess={onEditSuccess}
			/>
			<AlertSubscriptionDialog
				open={alertOpen}
				subscriptionId={subscription?.id}
				onOpen={onAlertOpenChange}
			/>
			<DeleteSubscriptionDialog
				open={deleteOpen}
				subscriptionId={subscription?.id}
				onSuccess={onDeleteSuccess}
			/>
		</div>
	);
}
