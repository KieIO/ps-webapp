import dayjs from 'dayjs';
import type { MyTask } from '../schemas/task.schema';
import { getTaskDeadline, getTaskStartDate } from './taskDetail';

/** URL sentinel so clearing the date does not re-apply the today default. */
export const WORK_DATE_ALL = 'all';
export const WORK_DATE_PARAM = 'workDate';

const WORK_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const EXISTING_FILTER_PARAMS = [
  'projectName',
  'search',
  'timeliness',
  'completedMonth',
  'outputMetric',
  'outputMonth',
] as const;

export const isValidWorkDate = (value: string): boolean => WORK_DATE_PATTERN.test(value);

/** Local calendar day — same “today” as Employee Home / capacity. */
export const todayWorkDate = (): string => dayjs().format('YYYY-MM-DD');

export const parseWorkDateParam = (value: string | null | undefined): string | undefined => {
  if (!value || value === WORK_DATE_ALL) return undefined;
  return isValidWorkDate(value) ? value : undefined;
};

/** Default to today only on a clean `/tasks/project` visit for personal inboxes. */
export const shouldDefaultWorkDate = (
  searchParams: URLSearchParams,
  defaultTodayEnabled: boolean,
): boolean => {
  if (!defaultTodayEnabled) return false;
  if (searchParams.has(WORK_DATE_PARAM)) return false;
  return EXISTING_FILTER_PARAMS.every((key) => !searchParams.get(key));
};

/**
 * True when the selected calendar day falls in the task work window:
 * start (`date`) ≤ workDate ≤ deadline.
 */
export const isTaskActiveOnWorkDate = (task: MyTask, workDate: string): boolean => {
  const startKey = getTaskStartDate(task).slice(0, 10);
  const endKey = getTaskDeadline(task).slice(0, 10);
  return workDate >= startKey && workDate <= endKey;
};
