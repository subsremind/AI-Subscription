"use client";

import { MobileIcon } from "@radix-ui/react-icons";
import { cn } from "@ui/lib";
import {
	CloudIcon,
	ComputerIcon,
	PaperclipIcon,
	StarIcon,
	WandIcon,
} from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { type JSXElementConstructor, type ReactNode, useState } from "react";
import heroImage from "../../../../public/images/hero.svg";

export const featureTabs: Array<{
	id: string;
	title: string;
	icon: JSXElementConstructor<any>;
	subtitle?: string;
	description?: ReactNode;
	image?: StaticImageData;
	imageBorder?: boolean;
	stack?: {
		title: string;
		href: string;
		icon: JSXElementConstructor<any>;
	}[];
	highlights?: {
		title: string;
		description: string;
		icon: JSXElementConstructor<any>;
		demoLink?: string;
		docsLink?: string;
	}[];
}> = [
{
	id: "reminders",
	title: "Multi-Channel Reminders",
	icon: StarIcon,
	subtitle: "Get notified via your favorite platforms before subscription renewals",
	description:
	"Never miss a subscription renewal again with our multi-channel reminder system. We send alerts to Teams, Slack, SMS, email, and more, ensuring you always have the chance to review and manage your subscriptions before they auto-renew.",
	stack: [],
	image: heroImage,
	imageBorder: false,
	highlights: [
		{
			title: "Cross-Platform Alerts",
			description:
			"Receive reminders on Teams, Slack, SMS, email, or your preferred communication platform. We integrate with the tools you already use daily.",
			icon: WandIcon,
		},
		{
			title: "Customizable Timing",
			description:
			"Set reminder intervals that work best for you - choose to be notified 7 days, 3 days, or even 24 hours before your subscription renews.",
			icon: ComputerIcon,
		},
		{
			title: "Priority Notifications",
			description:
			"We automatically flag high-cost or rarely-used subscriptions for special attention, ensuring you don't overlook important renewal decisions.",
			icon: MobileIcon,
		},
	],
	},
	{
		id: "ai-import",
		title: "AI-Powered Import",
		icon: CloudIcon,
		subtitle: "Automatically detect and organize your subscriptions",
		description:
		"Our advanced AI technology scans your emails, bank statements, and payment records to automatically identify and import all your subscription information. Say goodbye to manual data entry and scattered subscription records.",
		stack: [],
		image: heroImage,
		imageBorder: false,
		highlights: [
			{
				title: "Smart Payment Detection",
				description:
				"Automatically identifies recurring payments from bank statements and credit card bills, even when the merchant name differs slightly from the subscription service.",
				icon: WandIcon,
			},
			{
				title: "Email Scan Automation",
				description:
				"Our AI reviews your email inbox to discover subscription confirmations, payment receipts, and service updates from various providers.",
				icon: ComputerIcon,
			},
			{
				title: "Data Accuracy Assurance",
				description:
				"Cross-references multiple data sources to ensure accurate subscription details, including exact pricing, billing cycles, and service tiers.",
				icon: MobileIcon,
			},
		],
		},
	{
		id: "ai-analysis",
		title: "AI Subscription Optimizer",
		icon: PaperclipIcon,
		subtitle: "Cut costs with AI-driven subscription insights",
		description:
		"Leverage our AI analytics to understand your subscription usage patterns and receive personalized recommendations for more cost-effective alternatives. The system learns from your behavior to suggest optimal plans that save you money without sacrificing the features you need.",
		stack: [],
		image: heroImage,
		imageBorder: false,
		highlights: [
			{
				title: "Personalized Reports",
				description:
				"Generates detailed usage reports highlighting underutilized features and overpaid services, complete with visual charts and savings estimates.",
				icon: WandIcon,
			},
			{
				title: "Alternative Recommendations",
				description:
				"Our AI suggests cheaper or more suitable alternatives based on your actual usage patterns, highlighting features you actually use versus those you're paying for but never utilize.",
				icon: ComputerIcon,
			},
			{
				title: "Cost Trend Analysis",
				description:
				"Tracks how your subscription costs have changed over time and projects future expenses, helping you make informed decisions about which subscriptions to keep, upgrade, or cancel.",
				icon: MobileIcon,
			},
		],
	},
];

export function Features() {
	const [selectedTab, setSelectedTab] = useState(featureTabs[0].id);
	return (
		<section id="features" className="scroll-my-20 pt-12 lg:pt-16">
			<div className="container max-w-5xl">
				<div className="mx-auto mb-6 lg:mb-0 lg:max-w-5xl lg:text-center">
					<h2 className="font-bold text-4xl lg:text-5xl">
						Features your clients will love
					</h2>
					<p className="mt-6 text-balance text-lg opacity-50">
						In this section you can showcase all the features of
						your SaaS provides and how they can benefit your
						clients.
					</p>
				</div>

				<div className="mt-8 mb-4 hidden justify-center lg:flex">
					{featureTabs.map((tab) => {
						return (
							<button
								type="button"
								key={tab.id}
								onClick={() => setSelectedTab(tab.id)}
								className={cn(
									"flex w-24 flex-col items-center gap-2 rounded-lg px-4 py-2 md:w-32",
									selectedTab === tab.id
										? "bg-primary/5 font-bold text-primary dark:bg-primary/10"
										: "font-medium text-foreground/80",
								)}
							>
								<tab.icon
									className={cn(
										"size-6 md:size-8",
										selectedTab === tab.id
											? "text-primary"
											: "text-foreground opacity-30",
									)}
								/>
								<span className="text-xs md:text-sm">
									{tab.title}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<div className="bg-card dark:bg-card">
				<div className="container max-w-5xl">
					{featureTabs.map((tab) => {
						const filteredStack = tab.stack || [];
						const filteredHighlights = tab.highlights || [];
						return (
							<div
								key={tab.id}
								className={cn(
									"border-t py-8 first:border-t-0 md:py-12 lg:border-t-0 lg:py-16",
									selectedTab === tab.id
										? "block"
										: "block lg:hidden",
								)}
							>
								<div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
									<div>
										<h3 className="font-normal text-2xl text-foreground/60 leading-normal md:text-3xl">
											<strong className="text-secondary">
												{tab.title}.{" "}
											</strong>
											{tab.subtitle}
										</h3>

										{tab.description && (
											<p className="mt-4 text-foreground/60">
												{tab.description}
											</p>
										)}

										{filteredStack?.length > 0 && (
											<div className="mt-4 flex flex-wrap gap-6">
												{filteredStack.map(
													(tool, k) => (
														<a
															href={tool.href}
															target="_blank"
															key={`stack-tool-${k}`}
															className="flex items-center gap-2"
															rel="noreferrer"
														>
															<tool.icon className="size-6" />
															<strong className="block text-sm">
																{tool.title}
															</strong>
														</a>
													),
												)}
											</div>
										)}
									</div>
									<div>
										{tab.image && (
											<Image
												src={tab.image}
												alt={tab.title}
												className={cn(
													" h-auto w-full max-w-xl",
													{
														"rounded-2xl border-4 border-secondary/10":
															tab.imageBorder,
													},
												)}
											/>
										)}
									</div>
								</div>

								{filteredHighlights.length > 0 && (
									<div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{filteredHighlights.map(
											(highlight, k) => (
												<div
													key={`highlight-${k}`}
													className="flex flex-col items-stretch justify-between rounded-lg border p-4"
												>
													<div>
														<highlight.icon
															className="text-primary text-xl"
															width="1em"
															height="1em"
														/>
														<strong className="mt-2 block">
															{highlight.title}
														</strong>
														<p className="mt-1 text-sm opacity-50">
															{
																highlight.description
															}
														</p>
													</div>
												</div>
											),
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
