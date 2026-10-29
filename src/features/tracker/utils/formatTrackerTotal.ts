import type { TrackerProject } from '../schemas/tracker.schema';

/** Tracker Total column: `83` or `83/139` when plannedSlides is set. */
export const formatTrackerTotal = (
  project: Pick<TrackerProject, 'totalSlides' | 'plannedSlides'>,
): string => {
  const calculated = Math.round(project.totalSlides).toLocaleString();
  if (project.plannedSlides == null) {
    return calculated;
  }
  return `${calculated}/${project.plannedSlides.toLocaleString()}`;
};
