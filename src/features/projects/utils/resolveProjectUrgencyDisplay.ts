import type { ProjectStatus, ProjectUrgency, ProjectUrgencyColor } from '../schemas/project.schema';
import { PROJECT_URGENCY_COLORS } from '../schemas/project.schema';
import { calculateProjectUrgency } from './projectUrgency';

export const isProjectUrgencyColor = (value: string): value is ProjectUrgencyColor =>
  (PROJECT_URGENCY_COLORS as readonly string[]).includes(value);

/** Resolve stored setting (`auto` or locked color) to a badge/export color.
 * Finished/cancelled always display gray without requiring the stored setting to be overwritten. */
export const resolveProjectUrgencyDisplay = (project: {
  urgency: ProjectUrgency;
  status: ProjectStatus;
  endDate?: string | null;
}): ProjectUrgencyColor => {
  if (project.status === 'finish' || project.status === 'cancel') {
    return 'gray';
  }
  if (project.urgency === 'auto' || !isProjectUrgencyColor(project.urgency)) {
    return calculateProjectUrgency({
      status: project.status,
      endDate: project.endDate,
    });
  }
  return project.urgency;
};
