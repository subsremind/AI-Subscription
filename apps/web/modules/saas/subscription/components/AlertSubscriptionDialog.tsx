"use client";

import { useSession } from "@saas/auth/hooks/use-session";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@ui/components/table";
import { Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function AlertSubscriptionDialog({
	open,
	subscriptionId,
	onOpen,
}: {
	open: boolean;
	subscriptionId?: string;
	onOpen: (open: boolean) => void;
}) {
	const t = useTranslations();
	const [tableData, setTableData] = useState<any[]>([]);
	const { user } = useSession();

	const { data, isLoading } = useQuery({
		queryKey: ["subscription-alert", subscriptionId],
		queryFn: async () => {
			let url = "/api/subscription-alert";
			if (!subscriptionId) {
				return [];
			}
			url += `?subscriptionId=${subscriptionId}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("Get alert failed");
			}
			const data = await response.json();
			setTableData(data);
			return data;
		},
		staleTime: 0,
		enabled: !!open,
	});

	const handleCreate = () => {
		const newData = {
			subscriptionId: subscriptionId,
			intervalValue: 7,
			intervalUnit: "days",
			onField: "nextPaymentDate",
			contact: user?.id,
		};
		setTableData([...tableData, newData]);
	};

	const handleDelete = (row: any) => {
		const updatedData = tableData.filter((item) => item !== row.original);
		setTableData(updatedData);
	};

	const handleChange = (data: any, field: string, newValue: any) => {
		const updatedData = tableData.map((item) => {
			if (item === data) {
				return { ...item, [field]: newValue };
			}
			return item;
		});
		setTableData(updatedData);
	};

	const handleSave = () => {
		onOpen(false);
		saveMutation.mutate({
			subscriptionId: subscriptionId,
			alertList: tableData,
		});
	};

	const saveMutation = useMutation({
		mutationFn: async (params: { subscriptionId?: string; alertList: any[] }) => {
			const response = await fetch("/api/subscription-alert", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(params),
			});
			if (!response.ok) {
				throw new Error("Update failed");
			}
			return response.json();
		},
		onSuccess: () => {
			// queryClient.invalidateQueries({ queryKey: ["alerts"] });
			toast.success(t("common.status.success"));
		},
		onError: () => {
			toast.error(t("common.status.error"));
		},
	});

	const columns: ColumnDef<any>[] = [
		{
			accessorKey: "intervalValue",
			header: "Time Period",
			cell: ({ row }) => (
				<Select
					defaultValue={row.original.intervalValue.toString()}
					onValueChange={(value) =>
						handleChange(row.original, "intervalValue", value)
					}
				>
					<SelectTrigger className="w-[90px]">
						<SelectValue placeholder="Time Period" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{Array.from(
								{ length: 20 },
								(_, index) => index + 1,
							).map((num) => (
								<SelectItem key={num} value={num.toString()}>
									{num}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			),
		},
		{
			accessorKey: "intervalUnit",
			header: "",
			cell: ({ row }) => (
				<Select
					defaultValue={row.original.intervalUnit}
					onValueChange={(value) =>
						handleChange(row.original, "intervalUnit", value)
					}
				>
					<SelectTrigger className="w-[160px]">
						<SelectValue placeholder="" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="days">days before</SelectItem>
							<SelectItem value="weeks">weeks before</SelectItem>
							<SelectItem value="months">
								months before
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			),
		},
		{
			accessorKey: "onField",
			header: "Alert on",
			cell: ({ row }) => (
				<Select
					defaultValue={row.original.onField}
					onValueChange={(value) =>
						handleChange(row.original, "onField", value)
					}
				>
					<SelectTrigger className="w-[220px]">
						<SelectValue placeholder="" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="nextPaymentDate">
								Payment/Expiry Date
							</SelectItem>
							<SelectItem value="contractExpiry">
								Contract Expiry
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			),
		},
		{
			accessorKey: "contact",
			header: "Contact",
			cell: ({ row }) => (
				<Select
					defaultValue={row.original.contact}
					onValueChange={(value) =>
						handleChange(row.original, "contact", value)
					}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value={user?.id || ''}>
								{user?.name}
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => handleDelete(row)}
				>
					<Trash2Icon className="size-4" />
				</Button>
			),
		},
	];

	const table = useReactTable({
		data: tableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				onOpen(isOpen);
				if (!isOpen) {
					setTableData([]);
				}
			}}
		>
			<DialogContent
				className="w-full max-w-[50vw] max-h-[80vh] overflow-auto"
				onInteractOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>{t("subscription.alert.title")}</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col max-h-[60vh]">
					<Table className="w-full">
						<TableHeader className="sticky top-0 bg-white shadow-md z-10">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											className="font-bold text-black"
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
					</Table>
					<div className="overflow-y-auto max-h-[50vh]">
						<Table className="w-full">
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow key={row.id}>
											{row
												.getVisibleCells()
												.map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(
															cell.column
																.columnDef.cell,
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
					</div>
				</div>
				<DialogFooter>
					<Button variant="primary" onClick={handleCreate}>
						New Alert
					</Button>
					<Button onClick={() => onOpen(false)}>Cancel</Button>
					<Button variant="primary" onClick={handleSave}>
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
