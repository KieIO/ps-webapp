/** Display order for job levels (matches spreadsheet hierarchy). */
export const JOB_LEVEL_SORT_ORDER: Record<string, number> = {
  INTERN: 0,
  JUNIOR: 1,
  EXECUTIVE: 2,
  SENIOR: 3,
  MANAGER: 4,
};

/** Display order for job groups. */
export const JOB_GROUP_SORT_ORDER: Record<string, number> = {
  STAFF: 0,
  MANAGER: 1,
};

/**
 * Job-title family keys in spreadsheet order (project track, then creative track).
 * Used for row grouping and sort tie-breaking.
 */
export const JOB_TITLE_FAMILY_ORDER = [
  'intern',
  'jpe',
  'pe',
  'spe',
  'pm',
  'jgd',
  'gd',
  'sgd',
  'dm',
] as const;

export type JobTitleFamilyKey = (typeof JOB_TITLE_FAMILY_ORDER)[number] | 'other';

const FAMILY_ORDER_INDEX = Object.fromEntries(
  JOB_TITLE_FAMILY_ORDER.map((key, index) => [key, index]),
) as Record<JobTitleFamilyKey, number>;

/** Resolve a title code to its spreadsheet family (longer prefixes first). */
export const getJobTitleFamilyKey = (code: string): JobTitleFamilyKey => {
  const normalized = code.trim().toUpperCase();

  if (normalized === 'IN.0') return 'intern';
  if (normalized.startsWith('JPE-')) return 'jpe';
  if (normalized.startsWith('SPE-')) return 'spe';
  if (normalized.startsWith('PE-')) return 'pe';
  if (normalized.startsWith('PM-')) return 'pm';
  if (normalized.startsWith('JGD-')) return 'jgd';
  if (normalized.startsWith('SGD-')) return 'sgd';
  if (normalized.startsWith('GD-')) return 'gd';
  if (normalized.startsWith('DM-')) return 'dm';

  return 'other';
};

export const getJobTitleFamilySortIndex = (code: string): number =>
  FAMILY_ORDER_INDEX[getJobTitleFamilyKey(code)] ?? JOB_TITLE_FAMILY_ORDER.length;

/** Numeric suffix from codes like JPE-1, IN.0 — used for within-family ordering. */
export const getJobTitleLevelNumber = (code: string): number => {
  const normalized = code.trim().toUpperCase();

  if (normalized === 'IN.0') return 0;

  const match = normalized.match(/-(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};
