import { JOB_GROUP_SORT_ORDER, JOB_LEVEL_SORT_ORDER } from '../constants';
import type { JobGroup, JobLevel, JobTitle } from '../schemas/title.schema';

export const compareJobLevels = (a: JobLevel, b: JobLevel): number => {
  const orderA = a.sortOrder ?? JOB_LEVEL_SORT_ORDER[a.code] ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.sortOrder ?? JOB_LEVEL_SORT_ORDER[b.code] ?? Number.MAX_SAFE_INTEGER;
  return orderA - orderB || a.code.localeCompare(b.code);
};

export const compareJobGroups = (a: JobGroup, b: JobGroup): number => {
  const orderA = a.sortOrder ?? JOB_GROUP_SORT_ORDER[a.code] ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.sortOrder ?? JOB_GROUP_SORT_ORDER[b.code] ?? Number.MAX_SAFE_INTEGER;
  return orderA - orderB || a.code.localeCompare(b.code);
};

export const compareJobTitles = (a: JobTitle, b: JobTitle): number =>
  a.sortOrder - b.sortOrder || a.code.localeCompare(b.code);

export const getNextJobTitleSortOrder = (titles: readonly JobTitle[]): number =>
  titles.reduce((max, title) => Math.max(max, title.sortOrder), -1) + 1;
