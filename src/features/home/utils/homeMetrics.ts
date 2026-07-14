import dayjs from 'dayjs';
import type { Project } from '@/features/projects/schemas/project.schema';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import { getTaskDeadline, getTaskStartDate } from '@/features/tasks/utils/taskDetail';
import { DEADLINE_RISK_DAYS } from '../constants';

/** UTC calendar date key (YYYY-MM-DD) — aligned with task API day boundaries. */
export const toCalendarDateKey = (iso: string): string => iso.slice(0, 10);

/** Local calendar date key for "today" — matches capacity date filter. */
export const getTodayCalendarKey = (today = dayjs()): string => today.format('YYYY-MM-DD');

/** Inclusive day gap between two YYYY-MM-DD calendar keys (end − start). */
export const calendarDaysUntil = (fromKey: string, toKey: string): number => {
  const from = dayjs(`${fromKey}T00:00:00.000Z`);
  const to = dayjs(`${toKey}T00:00:00.000Z`);
  return to.diff(from, 'day');
};

/** True when the task is in progress today: startDate ≤ today ≤ endDate (inclusive). */
export const isTaskActiveToday = (task: MyTask, today = dayjs()): boolean => {
  const todayKey = getTodayCalendarKey(today);
  const startKey = toCalendarDateKey(getTaskStartDate(task));
  const endKey = toCalendarDateKey(getTaskDeadline(task));
  return todayKey >= startKey && todayKey <= endKey;
};

export interface DeadlineRiskProject {
  id: string;
  name: string;
  endDate: string;
  daysUntil: number;
}

/**
 * Deadline risk uses project `endDate` (Ngày kết thúc / urgency deadline).
 * At risk when days remaining ≤ DEADLINE_RISK_DAYS (includes overdue / negative).
 *
 * TODO(home-deadline): Product asked for `internalDeadline`. In the current API,
 * `endDate` is what urgency and Project Tracker use; BE `InternalDeadline` is
 * seeded from startDate on create. Switch when a dedicated internal deadline is exposed.
 */
export const getProjectDeadlineDaysUntil = (project: Project, today = dayjs()): number | null => {
  if (!project.endDate) return null;
  return calendarDaysUntil(getTodayCalendarKey(today), toCalendarDateKey(project.endDate));
};

export const isProjectDeadlineAtRisk = (project: Project, today = dayjs()): boolean => {
  const daysUntil = getProjectDeadlineDaysUntil(project, today);
  if (daysUntil == null) return false;
  return daysUntil <= DEADLINE_RISK_DAYS;
};

const toProjectDeadlineSummary = (
  project: Project,
  today = dayjs(),
): DeadlineRiskProject | null => {
  if (!project.endDate) return null;
  const daysUntil = getProjectDeadlineDaysUntil(project, today);
  if (daysUntil == null) return null;
  return {
    id: project.id,
    name: project.name,
    endDate: project.endDate,
    daysUntil,
  };
};

/** Running projects preview — nearest endDate first (overdue / at risk rise to top). */
export const listRunningProjectsPreview = (
  projects: Project[],
  today = dayjs(),
): DeadlineRiskProject[] =>
  projects
    .map((project) => toProjectDeadlineSummary(project, today))
    .filter((entry): entry is DeadlineRiskProject => entry != null)
    .sort((a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name));

export const listDeadlineRiskProjects = (
  projects: Project[],
  today = dayjs(),
): DeadlineRiskProject[] =>
  listRunningProjectsPreview(projects, today).filter(
    (project) => project.daysUntil <= DEADLINE_RISK_DAYS,
  );

export const countTasksByType = (tasks: MyTask[]): Array<{ type: string; count: number }> => {
  const counts = new Map<string, number>();
  for (const task of tasks) {
    const type = task.taskName.trim() || 'Uncategorized';
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
};
