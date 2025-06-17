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
			toast.success(t("subscription.form.deleteSuccess"));
			onSuccess(false, true);
		},
		onError: () => {
			toast.error(t("subscription.form.deleteFailed"));
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
						{t("subscription.form.delete")}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t("subscription.form.deleteConfirm")}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="text-base font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-200">{t("common.actions.cancel")}</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						onClick={() => deleteMutation.mutate(subscriptionId)}
					>
						{t("common.actions.delete")}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
