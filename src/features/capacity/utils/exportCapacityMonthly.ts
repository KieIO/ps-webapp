import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { downloadCsv } from '@/shared/utils/exportCsv';
import { CAPACITY_MONTHLY_ROW_LABELS } from '../constants';
import {
  CAPACITY_MONTHLY_ROW_KEYS,
  type CapacityMonthlyDay,
  type CapacityMonthlyFilters,
  type CapacityMonthlyResponse,
} from '../schemas/capacityMonthly.schema';

export const CAPACITY_MONTHLY_EXPORT_HEADERS = [
  'Date',
  'Day',
  'Weekend',
  'Has capacity data',
  'Has slides data',
  ...CAPACITY_MONTHLY_ROW_KEYS.flatMap((key) => [
    `Capacity · ${CAPACITY_MONTHLY_ROW_LABELS[key]} (%)`,
    `Slides · ${CAPACITY_MONTHLY_ROW_LABELS[key]}`,
  ]),
] as const;

export const buildCapacityMonthlyExportRows = (days: CapacityMonthlyDay[]): (string | number)[][] =>
  days.map((day) => [
    dayjs(day.date).format(DATE_FORMAT),
    day.dayOfMonth,
    day.isWeekend ? 'Yes' : 'No',
    day.hasData ? 'Yes' : 'No',
    day.hasSlidesData ? 'Yes' : 'No',
    ...CAPACITY_MONTHLY_ROW_KEYS.flatMap((key) => [day.capacity[key] ?? 0, day.slides[key] ?? 0]),
  ]);

const buildFilename = (
  data: Pick<CapacityMonthlyResponse, 'startDate' | 'endDate' | 'year' | 'month'>,
  filters: CapacityMonthlyFilters,
): string => {
  if (filters.mode === 'range') {
    return `capacity-monthly-${data.startDate}_${data.endDate}.csv`;
  }
  return `capacity-monthly-${data.year}-${String(data.month).padStart(2, '0')}.csv`;
};

export const exportCapacityMonthlyToCsv = (
  data: CapacityMonthlyResponse,
  filters: CapacityMonthlyFilters,
): void => {
  downloadCsv(
    buildFilename(data, filters),
    [...CAPACITY_MONTHLY_EXPORT_HEADERS],
    buildCapacityMonthlyExportRows(data.days),
  );
};
