import dayjs from 'dayjs';
import { DATE_FORMAT, ROUTES } from '@/config/constants';
import { CONFIRMATION_LABELS } from '../constants';
import { normalizeTaskDateEnd } from './taskDates';
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

/** Same calendar day as the task date — not the linked project's end date. */
export const getTaskDeadline = (task: MyTask): string => task.date;

export const formatTaskHistoryDateLabel = (
  occurredAt: string,
  kind: TaskHistoryEvent['kind'],
): string => {
  const value = dayjs(occurredAt);
  if (kind === 'deadline') {
    return value.format(DATE_FORMAT);
  }
  return value.format('DD/MM HH:mm');
};

/** Fallback timeline for mock mode when audit history is unavailable. */
export const buildFallbackTaskHistory = (task: MyTask): TaskHistoryEvent[] => {
  const events: TaskHistoryEvent[] = [
    {
      id: `${task.id}-created`,
      occurredAt: task.date,
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
    occurredAt: normalizeTaskDateEnd(getTaskDeadline(task)),
    description: 'Deadline',
    completed: task.staffConfirmation === 'finished',
    kind: 'deadline',
  });

  return events;
};
