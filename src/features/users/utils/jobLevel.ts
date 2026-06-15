import { JOB_LEVEL_SORT_ORDER, type JobLevel } from '@/features/capacity/constants';

export const mapJobLevelCode = (code?: string): JobLevel | null => {
  if (!code) return null;

  switch (code.toUpperCase()) {
    case 'MANAGER':
      return 'manager';
    case 'SENIOR':
      return 'senior';
    case 'EXECUTIVE':
      return 'executive';
    default:
      return 'junior';
  }
};

export const compareJobLevelCodes = (a?: string, b?: string) => {
  const levelA = mapJobLevelCode(a);
  const levelB = mapJobLevelCode(b);

  if (levelA && levelB) {
    return JOB_LEVEL_SORT_ORDER[levelA] - JOB_LEVEL_SORT_ORDER[levelB];
  }
  if (levelA) return -1;
  if (levelB) return 1;
  return 0;
};
