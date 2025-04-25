import "server-only";

import { config } from "@repo/config";
import type { Locale } from "@repo/i18n";
import { cookies } from "next/headers";

export async function getUserLocale() {
	const cookie = (await cookies()).get(config.i18n.localeCookieName);
	return cookie?.value ?? config.i18n.defaultLocale;
}

export async function setLocaleCookie(locale: Locale) {
	(await cookies()).set(config.i18n.localeCookieName, locale);
}

export async function getUserTimezone() {
	const cookie = (await cookies()).get(config.i18n.timezoneCookieName);
	return cookie?.value ?? new Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export async function setTimezoneCookie(timezone: string) {
	(await cookies()).set(config.i18n.timezoneCookieName, timezone);
}
