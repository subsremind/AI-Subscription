"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { adminOrganizationsQueryKey } from "@saas/admin/lib/api";
import { getAdminPath } from "@saas/admin/lib/links";
import { InviteMemberForm } from "@saas/organizations/components/InviteMemberForm";
import { OrganizationMembersBlock } from "@saas/organizations/components/OrganizationMembersBlock";
import {
	fullOrganizationQueryKey,
	useCreateOrganizationMutation,
	useFullOrganizationQuery,
	useUpdateOrganizationMutation,
} from "@saas/organizations/lib/api";
import { useRouter } from "@shared/hooks/router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Checkbox } from "@ui/components/checkbox";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@ui/lib"
import { Calendar } from "@ui/components/calendar"
import { format } from "date-fns"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ui/components/popover"

import { CalendarIcon } from "lucide-react";

const organizationFormSchema = z.object({
	name: z.string().min(1),
	dob: z.date().optional(),
	mobile: z.boolean().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export function OrganizationForm({
	organizationId,
}: {
	organizationId: string;
}) {
	const t = useTranslations();
	const router = useRouter();

	const { data: organization } = useFullOrganizationQuery(organizationId);

	const updateOrganizationMutation = useUpdateOrganizationMutation();
	const createOrganizationMutation = useCreateOrganizationMutation();
	const queryClient = useQueryClient();

	const form = useForm<OrganizationFormValues>({
		resolver: zodResolver(organizationFormSchema),
		defaultValues: {
			name: organization?.name ?? "",
		},
	});

	const onSubmit = form.handleSubmit(async ({ name }) => {
		try {
			const newOrganization = organization
				? await updateOrganizationMutation.mutateAsync({
						id: organization.id,
						name,
						updateSlug: organization.name !== name,
					})
				: await createOrganizationMutation.mutateAsync({
						name,
					});

			if (!newOrganization) {
				throw new Error("Could not save organization");
			}

			queryClient.setQueryData(
				fullOrganizationQueryKey(organizationId),
				newOrganization,
			);

			queryClient.invalidateQueries({
				queryKey: adminOrganizationsQueryKey,
			});

			toast.success(t("admin.organizations.form.notifications.success"));

			if (!organization) {
				router.replace(
					getAdminPath(`/organizations/${newOrganization.id}`),
				);
			}
		} catch (error) {
			toast.error(t("admin.organizations.form.notifications.error"));
		}
	});

	return (
		<div className="grid grid-cols-1 gap-4">
			<Card>
				<CardHeader>
					<CardTitle>
						{organization
							? t("admin.organizations.form.updateTitle")
							: t("admin.organizations.form.createTitle")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={onSubmit}
							className="grid grid-cols-1 gap-4"
						>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("admin.organizations.form.name")}
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="dob"
								render={({ field }) => (
									<FormItem className="flex flex-col">
									<FormLabel>Date of birth</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
										<FormControl>
											<Button
											variant={"outline"}
											className={cn(
													"w-full pl-3 text-left font-normal bg-transparent !text-foreground border border-input cursor-pointer", // 添加了cursor-pointer
													!field.value && "text-muted-foreground"
												)}
											>
											{field.value ? (
												format(field.value, "PPP")
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) =>
											date > new Date() || date < new Date("1900-01-01")
											}
											initialFocus
										/>
										</PopoverContent>
									</Popover>
									<FormDescription>
										Your date of birth is used to calculate your age.
									</FormDescription>
									<FormMessage />
									</FormItem>
								)}
								/>

							<FormField
								control={form.control}
								name="mobile"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
										Use different settings for my mobile devices
										</FormLabel>
										<FormDescription>
										You can manage your mobile notifications in the{" "}
										</FormDescription>
									</div>
									</FormItem>
								)}
								/>



							<div className="flex justify-end">
								<Button
									type="submit"
									loading={
										updateOrganizationMutation.isPending ||
										createOrganizationMutation.isPending
									}
								>
									{t("admin.organizations.form.save")}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			{organization && (
				<>
					<OrganizationMembersBlock
						organizationId={organization.id}
					/>
					<InviteMemberForm organizationId={organization.id} />
				</>
			)}
		</div>
	);
}
