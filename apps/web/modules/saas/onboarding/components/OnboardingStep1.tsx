"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { useSession } from "@saas/auth/hooks/use-session";
import { UserAvatarUpload } from "@saas/settings/components/UserAvatarUpload";
import { Button } from "@ui/components/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/components/command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ui/components/popover"
import {cn} from "@ui/lib";
import { ArrowRightIcon, Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	name: z.string(),
	locale: z.string(),
	timezone: z.string(),
});

const groupTimezonesByContinent = () => {
  const timezones = Intl.supportedValuesOf('timeZone');
  const grouped: Record<string, string[]> = {};
  
  timezones.forEach(tz => {
    const continent = tz.split('/')[0];
    if (!grouped[continent]) {
      grouped[continent] = [];
    }
    grouped[continent].push(tz);
  });
  
  return grouped;
};

type FormValues = z.infer<typeof formSchema>;

export function OnboardingStep1({ onCompleted }: { onCompleted: () => void }) {
	const t = useTranslations();
	const { user } = useSession();
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: user?.name ?? "",
			timezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
			locale: typeof window !== 'undefined' ? new Intl.Locale(navigator.language).language : 'en'
		},
	});

	useEffect(() => {
		if (user) {
			form.setValue("name", user.name ?? "");
		}
	}, [user]);

	const onSubmit: SubmitHandler<FormValues> = async ({ name, timezone }) => {
		form.clearErrors("root");

		try {
			await authClient.updateUser({
				name,
				timezone,
				locale: form.getValues('locale')
			});

			onCompleted();
		} catch (e) {
			form.setError("root", {
				type: "server",
				message: t("onboarding.notifications.accountSetupFailed"),
			});
		}
	};

	return (
		<div>
			<Form {...form}>
				<form
					className="flex flex-col items-stretch gap-8"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{t("onboarding.account.name")}
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="timezone"
						render={({ field }) => (
							<FormItem>
							{t("onboarding.account.timezone")}
							<Popover>
								<PopoverTrigger asChild>
								<FormControl>
									<Button
									variant="outline"
									role="combobox"
									className={cn(
													"w-full pl-3 text-left font-normal bg-transparent !text-foreground border border-input cursor-pointer", // Added cursor-pointer
													!field.value && "text-muted-foreground"
												)}
									>
									{field.value
										? field.value 
										: "Select timeZone"}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-[280px] p-0">
								<Command>
									<CommandInput placeholder="Search timeZone..." />
									<CommandList>
									<CommandEmpty>No timeZone found.</CommandEmpty>
									{Object.entries(groupTimezonesByContinent()).map(([continent, timezones]) => (
									<CommandGroup heading={continent} key={continent}>
										{timezones.map((timezone) => (
										<CommandItem
											value={timezone}
											key={timezone}
											onSelect={() => {
											form.setValue("timezone", timezone)
											}}
										>
											{timezone}
											<Check
											className={cn(
												"ml-auto",
												timezone === field.value
												? "opacity-100"
												: "opacity-0"
											)}
											/>
										</CommandItem>
										))}
									</CommandGroup>
									))}
									</CommandList>
								</Command>
								</PopoverContent>
							</Popover>
							</FormItem>
						)}
						/>

					

					<FormItem className="flex items-center justify-between gap-4">
						<div>
							<FormLabel>
								{t("onboarding.account.avatar")}
							</FormLabel>

							<FormDescription>
								{t("onboarding.account.avatarDescription")}
							</FormDescription>
						</div>
						<FormControl>
							<UserAvatarUpload
								onSuccess={() => {
									return;
								}}
								onError={() => {
									return;
								}}
							/>
						</FormControl>
					</FormItem>

					<Button type="submit" loading={form.formState.isSubmitting}>
						{t("onboarding.continue")}
						<ArrowRightIcon className="ml-2 size-4" />
					</Button>
				</form>
			</Form>
		</div>
	);
}
