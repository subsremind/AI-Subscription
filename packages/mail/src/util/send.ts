import { config } from "@repo/config";
import { logger } from "@repo/logs";
import type { mailTemplates } from "../../emails";
import { send } from "../provider";
import type { TemplateId } from "./templates";
import { getTemplate } from "./templates";

export async function sendEmail<T extends TemplateId>(
	params: {
		to: string;
		locale?: keyof typeof config.i18n.locales;
	} & (
		| {
				templateId: T;
				context: Omit<
					Parameters<(typeof mailTemplates)[T]>[0],
					"locale" | "translations"
				>;
		  }
		| {
				subject: string;
				text?: string;
				html?: string;
		  }
	),
) {
	const { to, locale = config.i18n.defaultLocale } = params;
	if (!to || typeof to !== 'string' || !to.includes('@')) {
		throw new Error('Invalid email address format');
	}

	let html: string;
	let text: string;
	let subject: string;

	if ("templateId" in params) {
		const { templateId, context } = params;
		const template = await getTemplate({
			templateId,
			context,
			locale,
		});
		subject = template.subject;
		text = template.text;
		html = template.html;
	} else {
		subject = params.subject;
		text = params.text ?? "";
		html = params.html ?? "";
	}

	try {
		await send({
			to,
			subject,
			text,
			html,
		});
		return true;
	} catch (e) {
		logger.error("send Failed to send email:", e);
		if (e instanceof Error) {
			logger.error("Error stack:", e.stack);
		}
		logger.error("Email provider config:", {
			host: process.env.MAIL_HOST,
			port: process.env.MAIL_PORT,
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS,
		});
		return false;
	}
}
