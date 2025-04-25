"use client";

import { authClient } from "@repo/auth/client";
import { useSession } from "@saas/auth/hooks/use-session";
import { SettingsItem } from "@saas/shared/components/SettingsItem";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
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
import { Check, ChevronsUpDown } from "lucide-react";
import {cn} from "@ui/lib";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateTimezone } from "@i18n/lib/update-locale";

export function UserTimeZoneForm() {
  const t = useTranslations();
  const { user } = useSession();
  const [timezone, setTimezone] = useState(user?.timezone);
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const router = useRouter();

  
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

  const updateTimezoneMutation = useMutation({
    mutationFn: async () => {
      if (!timezone) {
        return; 
      }

      await authClient.updateUser({
        timezone,
      });

      await updateTimezone(timezone);
      router.refresh();
    },
  });

  const saveTimezone = async () => {
    try {
      await updateTimezoneMutation.mutateAsync();

      toast.success(t("settings.account.timezone.notifications.success"));
    } catch {
      toast.error(t("settings.account.timezone.notifications.error"));
    }
  };


  return (
    <SettingsItem
			title={t("settings.account.timezone.title")}
			description={t("settings.account.timezone.description")}
		>
      <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
								<PopoverTrigger asChild>
									<Button
									variant="outline"
									role="combobox"
									className={cn(
													"w-full pl-3 text-left font-normal bg-transparent !text-foreground border border-input cursor-pointer", // Added cursor-pointer
													!timezone && "text-muted-foreground"
												)}
									>
									{timezone}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[280px] p-0">
								<Command>
									<CommandInput placeholder="Search timezone..." />
									<CommandList>
									<CommandEmpty>No timezone found.</CommandEmpty>
									{Object.entries(groupTimezonesByContinent()).map(([continent, timezones]) => (
									<CommandGroup heading={continent} key={continent}>
										{timezones.map((tz) => (
										<CommandItem
											value={tz}
											key={tz}
											onSelect={() => {
											  setTimezone(tz)
                        saveTimezone()
                        setTimezoneOpen(false)
											}}
										>
											{tz}
											<Check
											className={cn(
												"ml-auto",
												timezone === tz
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
    </SettingsItem>
  );
}