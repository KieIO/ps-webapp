import { DEPARTMENT_LABELS } from '@/features/users/constants';
import { downloadCsv } from '@/shared/utils/exportCsv';
import { JOB_LEVEL_LABELS, WORK_STATUS_LABELS } from '../constants';
import type { CapacityListFilters, EmployeeCapacity } from '../schemas/capacity.schema';
import { formatCapacityListPeriodLabel } from './capacityListPeriod';

export const CAPACITY_LIST_EXPORT_HEADERS = [
  'Employee',
  'Department',
  'Job level',
  'Position code',
  'Job title',
  'Điểm task CM',
  'Điểm task đã đạt',
  'Daily capacity points',
  'Work status',
  'Capacity (%)',
  'Period',
] as const;

export const buildCapacityListExportRows = (
  items: EmployeeCapacity[],
  periodLabel: string,
): (string | number)[][] =>
  items.map((item) => [
    item.name,
    DEPARTMENT_LABELS[item.department],
    JOB_LEVEL_LABELS[item.jobLevel],
    item.positionCode,
    item.jobTitleName,
    item.specialistTaskPoints,
    item.achievedTaskPoints,
    item.dailyCapacityPoints,
    WORK_STATUS_LABELS[item.workStatus],
    item.workStatus === 'off' || item.capacityPercent == null ? '' : item.capacityPercent,
    periodLabel,
  ]);

const buildFilename = (filters: CapacityListFilters): string => {
  if (filters.mode === 'date') {
    return `capacity-${filters.date}.csv`;
  }
  if (filters.mode === 'month') {
    return `capacity-${filters.year}-${String(filters.month).padStart(2, '0')}.csv`;
  }
  return `capacity-${filters.startDate}_${filters.endDate}.csv`;
};

export const exportCapacityListToCsv = (
  items: EmployeeCapacity[],
  filters: CapacityListFilters,
): void => {
  downloadCsv(
    buildFilename(filters),
    [...CAPACITY_LIST_EXPORT_HEADERS],
    buildCapacityListExportRows(items, formatCapacityListPeriodLabel(filters)),
  );
};
