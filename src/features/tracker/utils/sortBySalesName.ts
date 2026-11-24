/** Locale-aware Sales sort key; blank names sort after named rows. */
export const salesSortKey = (salesName: string | null | undefined): string =>
  salesName?.trim().toLocaleLowerCase('vi') ?? '';

/**
 * Stable alphabetical sort by Sales name (A→Z).
 * Projects without Sales stay at the end, keeping relative order among blanks.
 */
export const sortProjectsBySalesName = <T extends { id: string; salesName?: string | null }>(
  projects: readonly T[],
): T[] => {
  return projects
    .map((project, index) => ({ project, index }))
    .sort((a, b) => {
      const keyA = salesSortKey(a.project.salesName);
      const keyB = salesSortKey(b.project.salesName);
      const blankA = keyA.length === 0;
      const blankB = keyB.length === 0;
      if (blankA !== blankB) return blankA ? 1 : -1;
      const byName = keyA.localeCompare(keyB, 'vi', { sensitivity: 'base' });
      if (byName !== 0) return byName;
      return a.index - b.index;
    })
    .map(({ project }) => project);
};
