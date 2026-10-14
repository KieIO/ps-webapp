import type { ProjectMilestone } from '@/features/projects/schemas/milestone.schema';
import { MILESTONE_UNIT_LABELS } from '@/features/projects/schemas/milestone.schema';
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

export const formatMilestoneQuantity = (milestone: ProjectMilestone): string =>
  `${milestone.quantity} ${MILESTONE_UNIT_LABELS[milestone.unit]}`;

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
