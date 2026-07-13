import dayjs from 'dayjs';
import type { UrgencyKey } from '@/shared/constants/urgencyStyles';
import {
  PROJECT_URGENCY_COLORS,
  type ProjectUrgency,
} from '@/features/projects/schemas/project.schema';
import type { MyTask } from '../schemas/task.schema';
import { getTaskDeadline } from './taskDetail';

/** Mirror of BE `calculateTaskUrgency` — used by mocks and local defaults. */
export const calculateTaskUrgency = (
  task: Pick<MyTask, 'staffConfirmation' | 'date' | 'deadline'>,
): UrgencyKey => {
  if (task.staffConfirmation === 'finished') {
    return 'gray';
  }

  const deadline = getTaskDeadline(task);
  const daysUntil = dayjs(deadline).startOf('day').diff(dayjs().startOf('day'), 'day');

  // Keep `< 0 || <= 3` aligned with BE `calculateTaskUrgency` (overdue + within 3 days).
  if (daysUntil <= 3) {
    return 'red';
  }
  if (daysUntil <= 7) {
    return 'orange';
  }
  return 'green';
};

const isUrgencyColor = (value: string): value is UrgencyKey =>
  (PROJECT_URGENCY_COLORS as readonly string[]).includes(value);

/** Resolve stored setting (`auto` or locked color) to a badge/export color. */
export const resolveTaskUrgencyDisplay = (
  task: Pick<MyTask, 'urgency' | 'staffConfirmation' | 'date' | 'deadline'>,
): UrgencyKey => {
  if (task.urgency === 'auto' || !isUrgencyColor(task.urgency)) {
    return calculateTaskUrgency(task);
  }
  return task.urgency;
};

/** Normalize optional/invalid stored urgency to a valid setting (defaults to `auto`). */
export const normalizeTaskUrgencySetting = (urgency: ProjectUrgency | undefined): ProjectUrgency =>
  urgency && (urgency === 'auto' || isUrgencyColor(urgency)) ? urgency : 'auto';
