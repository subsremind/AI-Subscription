import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";


export function newDate(year: number,
    month: number,
    date: number,
    hours: number,
    minutes: number,
    seconds: number, timezone: string) {
	return new TZDate(year, month, date, hours, minutes, seconds, timezone);
}

/**
 * convert date to timezone, no convert to local time, just convert to timezone time, no convert to utc time
 * @param dateStr eg: 2021-01-01T00:00:00.000Z
 * @param timezone eg:America/New_York (-4)
 * @returns eg: 2021-01-01T04:00:00.000-04:00
 * after format: 2021-01-01T04:00:00.000Z
 */
export function dateStrToTZDate(dateStr: string, timezone: string) {
	return new TZDate(dateStr, timezone);
}

/**
 * convert date to timezone, no convert to local time, just convert to timezone time, no convert to utc time
 * @param date eg: 2021-01-01T00:00:00.000Z
 * @param timezone eg:America/New_York (-4)
 * @returns eg: 2021-01-01T04:00:00.000-04:00
 * after format: 2021-01-01T04:00:00.000Z
 */
export function dateToTZDate(date: Date, timezone: string) {
	return new TZDate(date, timezone);
}

/**
 * convert date to utc, no timezone info, just convert to utc time, no convert to local time
 * @param date eg: 2021-01-01T00:00:00.000Z
 * @param timezone eg:America/New_York (-4)
 * @returns eg: 2021-01-01T04:00:00.000Z
 */
export function dateToUTC(date: Date) {
	return format(new TZDate(date, "UTC"), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");	
}

/**
 * just use date(year, month, date, timezone), no convert
 * @param date eg: 2021-01-01T08:00:00.000Z
 * @param timezone eg:America/New_York (-4)
 * @returns eg: 2021-01-01T00:00:00.000-04:00
 * after format: 2021-01-01T04:00:00.000Z
 */
export function tzdate(date: Date | null, timezone: string) {
	if (!date) {
		date = new Date();		
	}
	return new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), timezone);
}


export function dateFormat(date: Date, formatStr: string) {
	return format(date, formatStr);
}


export function utcnow() {
	return tznow("UTC");
}

export function tznow(timezone: string) {
	return new TZDate(Date.now(), timezone);
}
