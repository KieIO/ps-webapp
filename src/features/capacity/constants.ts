import dayjs from 'dayjs';
import { DEPARTMENT_OPTIONS } from '@/features/users/constants';
import type { CapacityListFilters } from './schemas/capacity.schema';
import type { CapacityMonthlyFilters } from './schemas/capacityMonthly.schema';

export const getDefaultCapacityFilters = (): CapacityListFilters => ({
  mode: 'date',
  date: dayjs().format('YYYY-MM-DD'),
});

export const getDefaultCapacityMonthlyFilters = (): CapacityMonthlyFilters => ({
  mode: 'month',
  year: dayjs().year(),
  month: dayjs().month() + 1,
});

export const CAPACITY_MONTHLY_ROW_LABELS = {
  total: 'POKESLIDE',
  project: 'PROJECT',
  creative_hcm: 'CREATIVE HCM',
  creative_ag: 'CREATIVE AG',
} as const;

export const JOB_LEVELS = ['manager', 'senior', 'executive', 'junior'] as const;

export type JobLevel = (typeof JOB_LEVELS)[number];

export const JOB_LEVEL_LABELS: Record<JobLevel, string> = {
  manager: 'Manager',
  senior: 'Senior',
  executive: 'Executive',
  junior: 'Junior',
};

/** Representative daily capacity by job level — used in dev mock seed data. */
export const MOCK_DAILY_CAPACITY_BY_LEVEL: Record<JobLevel, number> = {
  manager: 920,
  senior: 980,
  executive: 680,
  junior: 520,
};

export const WORK_STATUSES = ['working', 'off'] as const;

export type WorkStatus = (typeof WORK_STATUSES)[number];

export const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  working: 'Working',
  off: 'Off',
};

export const WORK_STATUS_OPTIONS = WORK_STATUSES.map((value) => ({
  value,
  label: WORK_STATUS_LABELS[value],
}));

/** Sort order for job level column (manager → junior). */
export const JOB_LEVEL_SORT_ORDER: Record<JobLevel, number> = {
  manager: 0,
  senior: 1,
  executive: 2,
  junior: 3,
};

export { DEPARTMENT_OPTIONS };
