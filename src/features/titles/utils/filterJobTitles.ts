import type { JobTitle, JobTitleListFilters } from '../schemas/title.schema';

/** Apply list filters used by Title management Job titles tab. */
export const filterJobTitles = <
  T extends Pick<JobTitle, 'code' | 'name' | 'jobLevelId' | 'jobGroupId'>,
>(
  titles: readonly T[],
  filters: JobTitleListFilters,
): T[] => {
  const search = filters.search?.trim().toLowerCase();

  return titles.filter((title) => {
    if (filters.jobLevelId && title.jobLevelId !== filters.jobLevelId) return false;
    if (filters.jobGroupId && title.jobGroupId !== filters.jobGroupId) return false;
    if (search) {
      const haystack = `${title.code} ${title.name}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
};
