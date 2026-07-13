import dayjs from 'dayjs';
import type { ProjectStatus, ProjectUrgencyColor } from '../schemas/project.schema';

/** Mirror of BE `calculateUrgency` — used for Auto display resolution. */
export const calculateProjectUrgency = (input: {
  status: ProjectStatus;
  endDate?: string | null;
}): ProjectUrgencyColor => {
  if (input.status === 'finish' || input.status === 'cancel') {
    return 'gray';
  }

  if (!input.endDate) {
    return 'green';
  }

  const daysUntil = dayjs(input.endDate).startOf('day').diff(dayjs().startOf('day'), 'day');
  // Keep `<= 3` aligned with BE `calculateUrgency` (overdue + within 3 days).
  if (daysUntil <= 3) {
    return 'red';
  }
  if (daysUntil <= 7) {
    return 'orange';
  }
  return 'green';
};
