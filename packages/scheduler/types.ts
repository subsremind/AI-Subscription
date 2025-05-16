export interface ScheduledTask {
	id: string;
	cronExpression: string;
	task: () => Promise<void>;
}

export interface Scheduler {
	schedule(task: ScheduledTask): void;
	cancel(taskId: string): void;
}
