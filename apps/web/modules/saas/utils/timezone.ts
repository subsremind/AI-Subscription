import { useSession } from "@saas/auth/hooks/use-session";

export function formatDateWithTimezone(date: Date) {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	const { user } = useSession();
	const locale = user?.locale ?? "en-US";
	const tz =
		user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

	return new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone: tz,
	}).format(dateObj);
}

export function utcDate(date: Date | string) {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return new Date(
		Date.UTC(
			dateObj.getFullYear(),
			dateObj.getMonth(),
			dateObj.getDate(),
			dateObj.getHours(),
			dateObj.getMinutes(),
			dateObj.getSeconds(),
		),
	);
}
