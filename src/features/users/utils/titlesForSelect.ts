/** Job titles shown in user Level / Position selects, scoped by selected level. */
export function titlesForSelect<T extends { id: string; jobLevelId: string }>(
  titles: readonly T[],
  selectedJobLevelId: string | undefined,
  selectedJobTitleId: string | undefined,
): T[] {
  const filtered = titles.filter(
    (title) => !selectedJobLevelId || title.jobLevelId === selectedJobLevelId,
  );
  if (!selectedJobTitleId) return filtered;
  if (filtered.some((title) => title.id === selectedJobTitleId)) return filtered;
  const selectedTitle = titles.find((title) => title.id === selectedJobTitleId);
  return selectedTitle ? [selectedTitle, ...filtered] : filtered;
}
