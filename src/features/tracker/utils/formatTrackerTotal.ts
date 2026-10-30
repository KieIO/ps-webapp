import type { TrackerProject } from '../schemas/tracker.schema';

export type TrackerTotalParts = {
  calculated: string;
  /** Locale-formatted planned slides when set; otherwise omitted. */
  planned: string | null;
};

/** Split Total for UI: calculated vs optional manual planned. */
export const getTrackerTotalParts = (
  project: Pick<TrackerProject, 'totalSlides' | 'plannedSlides'>,
): TrackerTotalParts => {
  const calculated = Math.round(project.totalSlides).toLocaleString();
  if (project.plannedSlides == null) {
    return { calculated, planned: null };
  }
  return { calculated, planned: project.plannedSlides.toLocaleString() };
};

/** Tracker Total column text: `83` or `83/139` when plannedSlides is set (CSV / plain). */
export const formatTrackerTotal = (
  project: Pick<TrackerProject, 'totalSlides' | 'plannedSlides'>,
): string => {
  const { calculated, planned } = getTrackerTotalParts(project);
  return planned == null ? calculated : `${calculated}/${planned}`;
};
