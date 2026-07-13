import type { ProjectStatus, ProjectUrgency, ProjectUrgencyColor } from '../schemas/project.schema';
import { PROJECT_URGENCY_COLORS } from '../schemas/project.schema';
import { calculateProjectUrgency } from './projectUrgency';

export const isProjectUrgencyColor = (value: string): value is ProjectUrgencyColor =>
  (PROJECT_URGENCY_COLORS as readonly string[]).includes(value);

/** Resolve stored setting (`auto` or locked color) to a badge/export color. */
export const resolveProjectUrgencyDisplay = (project: {
  urgency: ProjectUrgency;
  status: ProjectStatus;
  endDate?: string | null;
}): ProjectUrgencyColor => {
  if (project.urgency === 'auto' || !isProjectUrgencyColor(project.urgency)) {
    return calculateProjectUrgency({
      status: project.status,
      endDate: project.endDate,
    });
  }
  return project.urgency;
};
