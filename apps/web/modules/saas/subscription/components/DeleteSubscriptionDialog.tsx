"use client";

import { useMutation } from "@tanstack/react-query";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@ui/components/alert-dialog";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

export function DeleteSubscriptionDialog({
	open,
	subscriptionId,
	onSuccess,
}: {
	open: boolean;
	subscriptionId: string;
	onSuccess: (open: boolean, reload: boolean) => void;
}) {
	const t = useTranslations();

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/subscription/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Delete failed");
			}
			return response.json();
		},
		onSuccess: () => {
			toast.success(t("common.status.success"));
			onSuccess(false, true);
		},
		onError: () => {
			toast.error(t("common.status.error"));
		},
	});

	return (
		<AlertDialog
			open={open}
			onOpenChange={(isOpen) => {
				onSuccess(isOpen, false);
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you absolutely sure?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently
						delete your data from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => deleteMutation.mutate(subscriptionId)}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
