import { db } from "@repo/database";
import { sendEmail } from "@repo/mail";
import { logger } from "@repo/logs";
import {
	utcnow,
	dateToTZDate,
	dateToUTC,
	dateFormat,
	newDate,
} from "@repo/utils";
import { isSameDay, isSameHour, subDays, subMonths, subWeeks } from "date-fns";

export async function sendSubscriptionAlerts() {
	const alerts = await db.subscriptionAlert.findMany({
		include: { subscription: true, user: true },
	});
	for (const alert of alerts) {
		if (!alert.subscription || !alert.user?.email) {
			continue;
		}

		logger.info(
			`Sending alert - subscriptionId: ${alert.subscriptionId} ${alert.id} for user  ${alert.user?.name} `,
		);

		if (alert.onField === "nextPaymentDate") {
			logger.info(
				`Sending alert - ${alert.intervalValue}  ${alert.intervalUnit} ${alert.onField} (${alert.subscription.nextPaymentDate}) ${alert.user?.timezone}`,
			);
		} else {
			logger.info(
				`Sending alert - ${alert.intervalValue}  ${alert.intervalUnit} ${alert.onField} (${alert.subscription.contractExpiry}) ${alert.user?.timezone}`,
			);
		}

		const baseDate =
			alert.onField === "nextPaymentDate"
				? alert.subscription.nextPaymentDate
				: alert.subscription.contractExpiry;

		if (!baseDate) {
			logger.warn(
				`No base date found for alert ${alert.id} onField ${alert.onField}`,
			);
			continue;
		}

		const baseDateTZ = dateToTZDate(baseDate, alert.user?.timezone || "UTC");

		let triggerDateTZ: Date;
		switch (alert.intervalUnit) {
			case "days":
				triggerDateTZ = subDays(baseDateTZ, alert.intervalValue);
				break;
			case "weeks":
				triggerDateTZ = subWeeks(baseDateTZ, alert.intervalValue);
				break;
			case "months":
				triggerDateTZ = subMonths(baseDateTZ, alert.intervalValue);
				break;
			default:
				logger.warn(
					`Unsupported intervalUnit: ${alert.intervalUnit} for alert ${alert.id}`,
				);
				continue;
		}

		const triggerDate = newDate(
			triggerDateTZ.getFullYear(),
			triggerDateTZ.getMonth(),
			triggerDateTZ.getDate(),
			9,
			0,
			0,
			alert.user?.timezone || "UTC",
		);

		const triggerDateUTC = dateToUTC(triggerDate);
		logger.info(
			`Sending alert - triggerDate triggerDateTZ triggerDateUTC ${triggerDateTZ} ${triggerDate} ${triggerDateUTC} `,
		);

		const today = utcnow();

		logger.info(
			`Sending alert - now ${dateFormat(today, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")} triggerUTC ${triggerDateUTC} ${isSameDay(today, triggerDate)} ${isSameDay(today, triggerDateUTC)} ${isSameHour(today, triggerDate)} ${isSameHour(today, triggerDateUTC)}`,
		);

		if (isSameDay(today, triggerDate) && isSameHour(today, triggerDate)) {
			logger.info(
				`Sending alert to ${alert.user.email} for subscription ${alert.subscriptionId}`,
			);
		} else {
			logger.info(
				`No alert needed for subscription ${alert.subscriptionId} today`,
			);
		}

		await sendEmail({
			to: alert.contact,
			subject: "Subscription Alert",
			text: `Your subscription ${alert.subscription.company} is due soon. Please pay by ${alert.subscription.nextPaymentDate}. Thank you.`,
		});
	}
}
