import type { ProjectMilestone } from '@/features/projects/schemas/milestone.schema';
import {
  MILESTONE_UNIT_LABELS,
  hasMilestoneVolume,
} from '@/features/projects/schemas/milestone.schema';
import { toMilestoneDateKey } from '@/features/projects/utils/milestoneValidation';

export type MilestoneDayGroup = {
  dateKey: string;
  milestones: ProjectMilestone[];
};

/** Group milestones that share the same calendar day (only same-day merge). */
export const groupMilestonesByDate = (
  milestones: readonly ProjectMilestone[],
): MilestoneDayGroup[] => {
  const byDate = new Map<string, ProjectMilestone[]>();

  for (const milestone of milestones) {
    const dateKey = toMilestoneDateKey(milestone.deadlineDate);
    const list = byDate.get(dateKey) ?? [];
    list.push(milestone);
    byDate.set(dateKey, list);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, items]) => ({ dateKey, milestones: items }));
};

export const formatMilestoneQuantity = (milestone: ProjectMilestone): string | null => {
  if (!hasMilestoneVolume(milestone) || milestone.quantity == null) {
    return null;
  }
  if (milestone.unit !== 'slides' && milestone.unit !== 'da' && milestone.unit !== 'others') {
    return null;
  }
  return `${milestone.quantity} ${MILESTONE_UNIT_LABELS[milestone.unit]}`;
};

/** Quick-view primary line when volume is empty: `Tên mốc - Ghi chú` (name only if no note). */
export const formatMilestoneNameNote = (milestone: ProjectMilestone): string => {
  const name = milestone.name.trim();
  const note = milestone.note?.trim() ?? '';
  return note ? `${name} - ${note}` : name;
};

/** Same-day stack: red if any incomplete; green only when all completed. */
export const isMilestoneGroupCompleted = (milestones: readonly ProjectMilestone[]): boolean =>
  milestones.length > 0 && milestones.every((item) => Boolean(item.completed));

/**
 * Incomplete same-day stack uses the amber “outside timeline” style when every
 * incomplete milestone is flagged outsideTimeline (feedback / todo / note).
 */
export const isMilestoneGroupOutsideTimeline = (
  milestones: readonly ProjectMilestone[],
): boolean => {
  const incomplete = milestones.filter((item) => !item.completed);
  return incomplete.length > 0 && incomplete.every((item) => Boolean(item.outsideTimeline));
};

/** Milestones visible in the selected month (by deadline date). */
export const filterMilestonesInMonth = (
  milestones: readonly ProjectMilestone[],
  month: { year: number; month: number },
): ProjectMilestone[] =>
  milestones.filter((milestone) => {
    const key = toMilestoneDateKey(milestone.deadlineDate);
    const [y, m] = key.split('-').map(Number);
    return y === month.year && m === month.month;
  });
