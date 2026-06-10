import type { MyTask, TaskConfirmationStatus } from '../schemas/task.schema';

export interface TaskConfirmationSummary {
  total: number;
  notUpdated: number;
  finished: number;
  confirmed: number;
  decline: number;
}

const EMPTY_SUMMARY: TaskConfirmationSummary = {
  total: 0,
  notUpdated: 0,
  finished: 0,
  confirmed: 0,
  decline: 0,
};

const STATUS_KEY: Record<TaskConfirmationStatus, keyof Omit<TaskConfirmationSummary, 'total'>> = {
  not_updated: 'notUpdated',
  finished: 'finished',
  confirmed: 'confirmed',
  decline: 'decline',
};

export const computeTaskConfirmationSummary = (tasks: MyTask[]): TaskConfirmationSummary => {
  if (tasks.length === 0) return EMPTY_SUMMARY;

  const summary: TaskConfirmationSummary = { ...EMPTY_SUMMARY, total: tasks.length };

  for (const task of tasks) {
    summary[STATUS_KEY[task.staffConfirmation]] += 1;
  }

  return summary;
};
