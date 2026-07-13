import dayjs from 'dayjs';
import { ROUTES } from '@/config/constants';
import { CONFIRMATION_LABELS } from '../constants';
import { formatTaskDateTime, normalizeTaskDateEnd, normalizeTaskDateStart } from './taskDates';
import type { MyTask, TaskCategory, TaskHistoryEvent } from '../schemas/task.schema';

export const TASK_CATEGORY_DEPARTMENT_LABELS: Record<TaskCategory, string> = {
  project: 'Creative',
  non_project: 'Internal',
};

const TASK_CODE_PROJECT_SEPARATOR = ' - ';

/** Task code without the trailing project reference (e.g. `PO.031.04.0306`). */
export const formatTaskCodeShort = (taskCode: string): string => {
  const trimmed = taskCode.trim();
  const separatorIndex = trimmed.indexOf(TASK_CODE_PROJECT_SEPARATOR);
  if (separatorIndex === -1) return trimmed;
  return trimmed.slice(0, separatorIndex);
};

/** Human-readable label for breadcrumbs and page headings on task detail. */
export const formatTaskDisplayId = (task: MyTask): string => {
  const name = task.taskName.trim();
  if (name) return name;
  const code = task.taskCode.trim();
  if (code) return code;
  return task.id;
};

export const getTaskListPath = (taskCategory: TaskCategory): string =>
  taskCategory === 'non_project' ? ROUTES.NON_PROJECT_TASKS : ROUTES.PROJECT_TASKS;

export const getTaskListLabel = (taskCategory: TaskCategory): string =>
  taskCategory === 'non_project' ? 'Non-project tasks' : 'Project Tasks';

export const getTaskListBackLabel = (taskCategory: TaskCategory): string =>
  taskCategory === 'non_project' ? 'Back to non-project tasks' : 'Back to project tasks';

export const formatTaskQuantity = (task: MyTask): string => {
  const unit = task.taskName.toLowerCase();
  return `${task.quantity} ${unit}`;
};

/** UTC start of the task calendar day (00:00:00). */
export const getTaskStartDate = (task: MyTask): string => normalizeTaskDateStart(task.date);

/**
 * UTC end of the task calendar day (23:59:59).
 * Prefers API `deadline` when present; otherwise derives from `date`.
 * Not the linked project's end date.
 */
export const getTaskDeadline = (task: Pick<MyTask, 'date' | 'deadline'>): string =>
  normalizeTaskDateEnd(task.deadline ?? task.date);

export const formatTaskHistoryDateLabel = (
  occurredAt: string,
  kind: TaskHistoryEvent['kind'],
): string => {
  if (kind === 'deadline') {
    return formatTaskDateTime(occurredAt);
  }
  return dayjs(occurredAt).format('DD/MM HH:mm');
};

/** Fallback timeline for mock mode when audit history is unavailable. */
export const buildFallbackTaskHistory = (task: MyTask): TaskHistoryEvent[] => {
  const events: TaskHistoryEvent[] = [
    {
      id: `${task.id}-created`,
      occurredAt: getTaskStartDate(task),
      description: `Task created — ${task.projectManager.name}`,
      completed: true,
      kind: 'event',
    },
  ];

  if (task.staff.length > 0) {
    const names = task.staff.map((member) => member.name).join(', ');
    events.push({
      id: `${task.id}-assigned`,
      occurredAt: task.updatedAt ?? task.date,
      description: `${names} assigned`,
      completed: true,
      kind: 'event',
    });
  }

  if (task.staffConfirmation !== 'not_updated') {
    events.push({
      id: `${task.id}-status`,
      occurredAt: task.updatedAt ?? task.date,
      description: `Status: ${CONFIRMATION_LABELS[task.staffConfirmation]}`,
      completed: task.staffConfirmation === 'finished',
      kind: 'event',
    });
  }

  events.push({
    id: `${task.id}-deadline`,
    occurredAt: getTaskDeadline(task),
    description: 'Deadline',
    completed: task.staffConfirmation === 'finished',
    kind: 'deadline',
  });

  return events;
};
