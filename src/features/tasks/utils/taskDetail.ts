import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ROUTES } from '@/config/constants';
import { CONFIRMATION_LABELS } from '../constants';
import { formatTaskDateTime, normalizeTaskDateEnd, normalizeTaskDateStart } from './taskDates';
import type { MyTask, TaskCategory, TaskHistoryEvent } from '../schemas/task.schema';

dayjs.extend(utc);

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

export const formatTaskQuantity = (task: Pick<MyTask, 'quantity'>): string => String(task.quantity);

/** UTC start of the task calendar day (00:00:00). */
export const getTaskStartDate = (task: MyTask): string => normalizeTaskDateStart(task.date);

/**
 * Effective task deadline timestamp.
 * Prefers API `deadline` (exact time) when present; otherwise end of `date` day.
 * Not the linked project's end date.
 */
export const getTaskDeadline = (task: Pick<MyTask, 'date' | 'deadline'>): string => {
  if (task.deadline) {
    return dayjs.utc(task.deadline).toISOString();
  }
  return normalizeTaskDateEnd(task.date);
};

export const formatTaskHistoryDateLabel = (
  occurredAt: string,
  kind: TaskHistoryEvent['kind'],
): string => {
  if (kind === 'deadline') {
    return formatTaskDateTime(occurredAt);
  }
  return dayjs(occurredAt).format('DD/MM HH:mm');
};

const isCreativeDepartment = (department: string | null | undefined): boolean => {
  const value = department?.trim().toLowerCase() ?? '';
  return value === 'creative' || value.startsWith('creative_');
};

const isCreativeHandoff = (task: MyTask): boolean =>
  isCreativeDepartment(task.department) && task.staff.length === 0;

/** Create-time handoff line. Unknown departments keep the older assignee wording. */
const assignmentHistoryLine = (task: MyTask): string | null => {
  const names = task.staff.map((member) => member.name).filter(Boolean);
  if (isCreativeDepartment(task.department)) {
    return names.length > 0 ? `Giao phòng Creative — ${names.join(', ')}` : 'Gửi phòng Creative';
  }
  if (task.department?.trim().toLowerCase() === 'project' && names.length > 0) {
    return `Giao phòng Project — ${names.join(', ')}`;
  }
  if (names.length === 0) return null;
  return `${names.join(', ')} assigned`;
};

/** Fallback timeline for mock mode when audit history is unavailable. */
export const buildFallbackTaskHistory = (task: MyTask): TaskHistoryEvent[] => {
  const events: TaskHistoryEvent[] = [
    {
      id: `${task.id}-created`,
      occurredAt: getTaskStartDate(task),
      // Creator name comes from API history; mock fallback must not invent PM as creator.
      description: 'Task created',
      completed: true,
      kind: 'event',
    },
  ];

  if (task.staff.length > 0 || isCreativeHandoff(task)) {
    const description = assignmentHistoryLine(task);
    if (description) {
      events.push({
        id: `${task.id}-assigned`,
        occurredAt: task.updatedAt ?? task.date,
        description,
        completed: true,
        kind: 'event',
      });
    }
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
