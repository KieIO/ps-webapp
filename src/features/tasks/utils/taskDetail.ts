import dayjs from 'dayjs';
import { DATE_FORMAT, ROUTES } from '@/config/constants';
import { CONFIRMATION_LABELS } from '../constants';
import type { MyTask, TaskCategory } from '../schemas/task.schema';

export const TASK_CATEGORY_DEPARTMENT_LABELS: Record<TaskCategory, string> = {
  project: 'Creative',
  non_project: 'Internal',
};

export const formatTaskDisplayId = (task: MyTask): string =>
  task.id.replace(/^task-/, 'T-').replace(/^npt-/, 'NPT-').toUpperCase();

export const getTaskListPath = (taskCategory: TaskCategory): string =>
  taskCategory === 'non_project' ? ROUTES.NON_PROJECT_TASKS : ROUTES.PROJECT_TASKS;

export const getTaskListLabel = (taskCategory: TaskCategory): string =>
  taskCategory === 'non_project' ? 'Non-project tasks' : 'Project Tasks';

export const formatTaskQuantity = (task: MyTask): string => {
  const unit = task.taskName.toLowerCase();
  return `${task.quantity} ${unit}`;
};

export const getTaskDeadline = (task: MyTask): string =>
  task.updatedAt ?? task.date;

export interface TaskHistoryEvent {
  key: string;
  dateLabel: string;
  description: string;
  completed: boolean;
}

export const buildTaskHistoryEvents = (task: MyTask): TaskHistoryEvent[] => {
  const events: TaskHistoryEvent[] = [];
  const createdAt = dayjs(task.date);

  events.push({
    key: 'created',
    dateLabel: createdAt.format('DD/MM HH:mm'),
    description: `Task created — ${task.projectManager.name}`,
    completed: true,
  });

  if (task.staff.length > 0) {
    const assignee = task.staff[0];
    events.push({
      key: 'assigned',
      dateLabel: createdAt.add(15, 'minute').format('DD/MM HH:mm'),
      description: `${assignee.name} assigned`,
      completed: true,
    });
  }

  if (task.staffConfirmation === 'confirmed' || task.staffConfirmation === 'finished') {
    const assignee = task.staff[0]?.name ?? 'Assignee';
    events.push({
      key: 'confirmed',
      dateLabel: createdAt.add(30, 'minute').format('DD/MM HH:mm'),
      description: `${assignee} confirmed`,
      completed: true,
    });
  }

  if (task.staffConfirmation !== 'not_updated') {
    events.push({
      key: 'status',
      dateLabel: dayjs(task.updatedAt ?? task.date).format('DD/MM HH:mm'),
      description: `Status: ${CONFIRMATION_LABELS[task.staffConfirmation]}`,
      completed: task.staffConfirmation === 'finished',
    });
  }

  events.push({
    key: 'deadline',
    dateLabel: dayjs(getTaskDeadline(task)).format(DATE_FORMAT),
    description: 'Deadline',
    completed: task.staffConfirmation === 'finished',
  });

  return events;
};
