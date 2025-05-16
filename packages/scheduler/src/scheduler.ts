import { logger } from "@repo/logs"; // Assuming you have a logger set up in @repo/logger/index.ts
import { CronJob } from "cron";
import type { ScheduledTask, Scheduler } from "../types";

class SchedulerImpl implements Scheduler {
	private jobs: Map<string, CronJob> = new Map();

	schedule(task: ScheduledTask): void {
		const job = new CronJob(
			task.cronExpression,
			async () => {
				try {
					await task.task();
				} catch (error) {
					logger.error(`Task ${task.id} failed:`, error);
				}
			},
			null,
			true,
		);
		this.jobs.set(task.id, job);
	}

	cancel(taskId: string): void {
		const job = this.jobs.get(taskId);
		if (job) {
			job.stop();
			this.jobs.delete(taskId);
		}
	}
}

export const scheduler = new SchedulerImpl();
