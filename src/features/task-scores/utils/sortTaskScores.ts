import type { TaskScore } from '../schemas/taskScore.schema';

export const buildTaskScoreGroupSortOrder = (
  groups: readonly { code: string; sortOrder: number }[],
): Record<string, number> =>
  Object.fromEntries(groups.map((group) => [group.code, group.sortOrder]));

export const compareTaskScores = (
  a: TaskScore,
  b: TaskScore,
  groupSortOrder: Record<string, number>,
): number => {
  const orderA = groupSortOrder[a.group] ?? Number.MAX_SAFE_INTEGER;
  const orderB = groupSortOrder[b.group] ?? Number.MAX_SAFE_INTEGER;
  return orderA - orderB || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
};

export const getNextTaskScoreSortOrder = (items: readonly TaskScore[]): number =>
  items.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;
