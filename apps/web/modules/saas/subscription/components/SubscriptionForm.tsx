"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@saas/auth/hooks/use-session";
import { tzdate, dateStrToTZDate, dateToUTC, dateFormat } from "@repo/utils"
import { Button } from "@ui/components/button";
import { Calendar } from "@ui/components/calendar";
import { Checkbox } from "@ui/components/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Textarea } from "@ui/components/textarea";
import { cn } from "@ui/lib";
import { CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const CURRENCIES = [
	"USD",
	"GBP",
	"EUR",
	"AUD",
	"NZD",
	"AED",
	"AFN",
	"ALL",
	"AMD",
	"ANG",
	"AOA",
	"ARS",
	"AWG",
	"AZN",
	"BAM",
	"BBD",
	"BDT",
	"BGN",
	"BHD",
	"BIF",
	"BMD",
	"BND",
	"BOB",
	"BRL",
	"BSD",
	"BTC",
	"BTN",
	"BTS",
	"BWP",
	"BYN",
	"BZD",
	"CAD",
	"CDF",
	"CHF",
	"CLF",
	"CLP",
	"CNH",
	"CNY",
	"COP",
	"CRC",
	"CUC",
	"CUP",
	"CVE",
	"CZK",
	"DASH",
	"DJF",
	"DKK",
	"DOGE",
	"DOP",
	"DZD",
	"EAC",
	"EGP",
	"EMC",
	"ERN",
	"ETB",
	"ETH",
	"FCT",
	"FJD",
] as const;

const CYCLES = ["Daily", "Weekly", "Monthly", "Yearly"] as const;
const TYPES = ["Subscription", "Trial", "Lifetime", "Revenue"] as const;
const PAYMENT_METHODS = ["PayPal", "Credit Card", "Free"] as const;

const formSchema = z.object({
	company: z.string().min(1),
	description: z.string().optional(),
	frequency: z.number().min(1, "Frequency must be at least 1"),
	value: z
		.number()
		.min(0, "Amount cannot be less than 0")
		.refine((val) => !Number.isNaN(val), {
			message: "Amount must be a number",
		}),
	currency: z.enum(CURRENCIES),
	cycle: z.enum(CYCLES),
	type: z.enum(TYPES),
	recurring: z.boolean(),
	nextPaymentDate: z.string().datetime().optional(),
	contractExpiry: z.string().datetime().optional(),
	urlLink: z.string().optional(),
	paymentMethod: z.string().nullable().default(null).optional(),
	categoryId: z.string().nullable().default(null).optional(),
	notes: z.string().optional(),
	notesIncluded: z.boolean(),
	tags: z.array(z.string()).optional(),
	organizationId: z.string().nullable().default(null).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SubscriptionForm({
	subscription,
	categoryId,
	organizationId,
	onSuccess,
}: {
	subscription?: any;
	categoryId?: string;
	organizationId?: string;
	onSuccess: (open: boolean, isReload: boolean) => void;
}) {
	const t = useTranslations();

	const { user } = useSession();

	const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
		queryKey: ["subscription-categories-select", organizationId],
		queryFn: async () => {
			const url = organizationId
				? `/api/subscription-categories/select?organizationId=${organizationId}`
				: "/api/subscription-categories/select";
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("Failed to fetch categories");
			}
			return await response.json();
		},
	});

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: subscription
			? {
					...subscription,
					value: subscription.value ? Number(subscription.value) : 0,
					frequency: subscription.frequency
						? Number(subscription.frequency)
						: 1,
					nextPaymentDate: subscription.nextPaymentDate
						? new Date(subscription.nextPaymentDate).toISOString()
						: undefined,
					contractExpiry: subscription.contractExpiry
						? new Date(subscription.contractExpiry).toISOString()
						: undefined,
				}
			: {
					company: "",
					description: "",
					frequency: 1,
					value: 0,
					currency: "USD",
					cycle: "Monthly",
					type: "Subscription",
					recurring: true,
					nextPaymentDate: undefined,
					contractExpiry: undefined,
					urlLink: "",
					paymentMethod: "",
					categoryId: categoryId,
					notes: "",
					notesIncluded: false,
					tags: [],
				},
	});

	const onSubmit = form.handleSubmit(async (data) => {
		try {
			if (data.categoryId === "none" || data.categoryId === "") {
				data.categoryId = null;
			}
			if (data.paymentMethod === "none" || data.paymentMethod === "") {
				data.paymentMethod = null;
			}
			const url = subscription
				? `/api/subscription/${subscription.id}`
				: "/api/subscription";
			const method = subscription ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					organizationId,
				}),
			});

			if (!response.ok) {
				throw new Error(
					subscription
						? "Failed to update subscription"
						: "Failed to create subscription",
				);
			}

			toast.success(t("common.status.success"));
			onSuccess(false, true);
		} catch (e) {
			toast.error(t("common.status.error"));
		}
	});

	return (
		<Form {...form}>
			<form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
				<FormField
					control={form.control}
					name="company"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.company")}</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.description")}</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="value"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.amount")}</FormLabel>
							<FormControl>
								<Input
									type="number"
									min={0}
									step="0.01" // Add this line to support two decimal places
									{...field}
									onChange={(e) =>
										field.onChange(Number(e.target.value))
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="currency"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.currency")}</FormLabel>
							<FormControl>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="w-full max-h-[300px] overflow-y-auto">
										{CURRENCIES.map((currency) => (
											<SelectItem
												key={currency}
												value={currency}
											>
												{currency}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="cycle"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.cycle")}</FormLabel>
							<FormControl>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{CYCLES.map((cycle) => (
											<SelectItem
												key={cycle}
												value={cycle}
											>
												{cycle}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="frequency"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.frequency")}</FormLabel>
							<FormControl>
								<Input
									type="number"
									min={1}
									{...field}
									onChange={(e) =>
										field.onChange(Number(e.target.value))
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.type")}</FormLabel>
							<FormControl>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{TYPES.map((type) => (
											<SelectItem key={type} value={type}>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="recurring"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.recurring")}</FormLabel>
							<FormControl>
								<Select
									onValueChange={(value) =>
										field.onChange(value === "true")
									}
									value={field.value ? "true" : "false"}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="true">
											Yes
										</SelectItem>
										<SelectItem value="false">
											No
										</SelectItem>
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="nextPaymentDate"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>{t("subscription.nextPaymentDate")}</FormLabel>
							<Popover modal={true}>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full pl-3 text-left font-normal bg-transparent !text-foreground border border-input cursor-pointer", // Added cursor-pointer
												!field.value &&
													"text-muted-foreground",
											)}
										>
											{field.value ? (
												dateFormat(
													dateStrToTZDate(field.value, user?.timezone || 'UTC'),
													"PPP",
												)
											) : (
												<span>{t("subscription.pickADate")}</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-4 bg-popover shadow-lg rounded-lg border border-border"
									align="start"
								>
									<style>{`
										.rdp-caption_dropdowns {
											display: flex !important;
											flex-direction: row !important;
											gap: 0.5rem !important;
											align-items: center !important;
										}
									`}</style>
									<Calendar
										mode="single"
										selected={
											field.value
												? dateStrToTZDate(field.value, user?.timezone || 'UTC')
												: undefined
										}
										onSelect={(date) => {
											if (date) {
												field.onChange(
													dateToUTC(tzdate(date, user?.timezone || 'UTC'))
												);
											}
										}}
										disabled={(date) =>
											date < new Date() ||
											date < new Date("1900-01-01")
										}
										initialFocus
										className="
											[&_.rdp-caption_label]:hidden
											[&_.rdp-caption]:flex [&_.rdp-caption]:gap-2 [&_.rdp-caption]:items-center
											[&_.rdp-caption_dropdowns]:flex [&_.rdp-caption_dropdowns]:gap-2 [&_.rdp-caption_dropdowns]:items-center
											[&_.rdp-caption>*:first-child]:hidden
											[&_.text-sm] [&_.font-medium]:hidden
											[&_.rdp-nav]:hidden
											[&_.rdp-vhidden]:hidden
											[&_.rdp-dropdown]:bg-popover [&_.rdp-dropdown]:border [&_.rdp-dropdown]:border-border
											[&_.rdp-dropdown]:rounded-md [&_.rdp-dropdown]:shadow-sm [&_.rdp-dropdown]:p-1
											[&_.rdp-dropdown]:text-sm [&_.rdp-dropdown]:min-w-[120px] [&_.rdp-dropdown]:max-h-[200px]
											[&_.rdp-dropdown]:overflow-y-auto [&_.rdp-dropdown]:scrollbar-thin
											[&_.rdp-dropdown]:scrollbar-thumb-border [&_.rdp-dropdown]:scrollbar-track-transparent
										"
										fromYear={new Date().getFullYear()}
										toYear={new Date().getFullYear() + 10}
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="contractExpiry"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>{t("subscription.contractExpiry")}</FormLabel>
							<Popover modal={true}>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full pl-3 text-left font-normal bg-transparent !text-foreground border border-input cursor-pointer", // Added cursor-pointer
												!field.value &&
													"text-muted-foreground",
											)}
										>
											{field.value ? (
												dateFormat(
													dateStrToTZDate(field.value, user?.timezone || 'UTC'),
													"PPP",
												)
											) : (
												<span>{t("subscription.pickADate")}</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-4 bg-popover shadow-lg rounded-lg border border-border"
									align="start"
								>
									<style>{`
										.rdp-caption_dropdowns {
											display: flex !important;
											flex-direction: row !important;
											gap: 0.5rem !important;
											align-items: center !important;
										}
									`}</style>
									<Calendar
										mode="single"
										selected={
											field.value
												? dateStrToTZDate(field.value, user?.timezone || 'UTC')
												: undefined
										}
										onSelect={(date) => {
											if (date) {
												field.onChange(
													dateToUTC(tzdate(date, user?.timezone || 'UTC'))
												);
											}
										}}
										disabled={(date) =>
											date < new Date() ||
											date < new Date("1900-01-01")
										}
										initialFocus
										className="
											[&_.rdp-caption_label]:hidden
											[&_.rdp-caption]:flex [&_.rdp-caption]:gap-2 [&_.rdp-caption]:items-center
											[&_.rdp-caption_dropdowns]:flex [&_.rdp-caption_dropdowns]:gap-2 [&_.rdp-caption_dropdowns]:items-center
											[&_.rdp-caption>*:first-child]:hidden
											[&_.text-sm] [&_.font-medium]:hidden
											[&_.rdp-nav]:hidden
											[&_.rdp-vhidden]:hidden
											[&_.rdp-dropdown]:bg-popover [&_.rdp-dropdown]:border [&_.rdp-dropdown]:border-border
											[&_.rdp-dropdown]:rounded-md [&_.rdp-dropdown]:shadow-sm [&_.rdp-dropdown]:p-1
											[&_.rdp-dropdown]:text-sm [&_.rdp-dropdown]:min-w-[120px] [&_.rdp-dropdown]:max-h-[200px]
											[&_.rdp-dropdown]:overflow-y-auto [&_.rdp-dropdown]:scrollbar-thin
											[&_.rdp-dropdown]:scrollbar-thumb-border [&_.rdp-dropdown]:scrollbar-track-transparent
										"
										fromYear={new Date().getFullYear()}
										toYear={new Date().getFullYear() + 10}
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="paymentMethod"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.paymentMethod")}</FormLabel>
							<FormControl>
								<Select
									onValueChange={(value) =>
										field.onChange(
											value === "" ? null : value,
										)
									}
									value={field.value || ""}
									defaultValue={field.value || ""}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={t("subscription.placeholder.selectPaymentMethod")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">
											None
										</SelectItem>
										{PAYMENT_METHODS.map((method) => (
											<SelectItem
												key={method}
												value={method}
											>
												{method}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="urlLink"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.urlLink")}</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="categoryId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("subscription.category")}</FormLabel>
							<FormControl>
								<Select
									onValueChange={field.onChange}
									value={field.value ?? undefined}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={t("subscription.placeholder.selectCategory")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">
											None
										</SelectItem>
										{categories.map(
											(category: {
												id: string;
												name: string;
											}) => (
												<SelectItem
													key={category.id}
													value={category.id}
												>
													{category.name}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem className="col-span-2">
							<div className="flex items-center justify-between mb-2">
								<FormLabel>{t("subscription.notes")}</FormLabel>
								<FormField
									control={form.control}
									name="notesIncluded"
									render={({ field: notesIncludedField }) => (
										<div className="flex items-center space-x-2">
											<FormLabel className="text-sm font-normal">
												Include in alerts
											</FormLabel>
											<FormControl>
												<Checkbox
													checked={
														notesIncludedField.value
													}
													onCheckedChange={
														notesIncludedField.onChange
													}
												/>
											</FormControl>
										</div>
									)}
								/>
							</div>
							<FormControl>
								<Textarea {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{Object.entries(form.formState.errors).length > 0 && (
  <div className="bg-red-100 p-4 rounded-md mb-4">
    <p className="text-red-800">Please fix the errors below:</p>
    {Object.entries(form.formState.errors).map(([name, error]) => (
      <div key={name} className="mt-2">
        <p className="text-sm text-red-600">
          {name}: {error.message}
        </p>
      </div>
    ))}
  </div>
)}


				<div className="col-span-2 w-full flex justify-end">
					<Button
						variant="primary"
						type="submit"
						loading={form.formState.isSubmitting}
						className="flex items-center space-x-2"
					>
						{t("common.confirmation.confirm")}
					</Button>
				</div>
			</form>
		</Form>
	);
}
