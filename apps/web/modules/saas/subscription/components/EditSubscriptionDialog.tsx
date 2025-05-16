"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { useTranslations } from "next-intl";
import { SubscriptionForm } from "./SubscriptionForm";

export function EditSubscriptionDialog({
	open,
	categoryId,
	organizationId,
	subscription,
	onSuccess,
}: {
	open: boolean;
	categoryId?: string;
	organizationId?: string;
	subscription?: any;
	onSuccess: (open: boolean, isReload: boolean) => void;
}) {
	const t = useTranslations();
	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				onSuccess(isOpen, false);
			}}
		>
			<DialogContent
				className="w-[45rem] !max-w-[45vw]"
				onInteractOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>
						{subscription
							? t("common.actions.edit")
							: t("common.actions.new")}
					</DialogTitle>
				</DialogHeader>
				<SubscriptionForm
					subscription={subscription}
					categoryId={categoryId}
					organizationId={organizationId}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}
