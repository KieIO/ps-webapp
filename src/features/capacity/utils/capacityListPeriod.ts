import dayjs from 'dayjs';
import type { CapacityListFilters } from '../schemas/capacity.schema';
import { formatPeriodLabel } from './formatPeriodLabel';

export function formatCapacityListPeriodLabel(filters: CapacityListFilters): string {
  if (filters.mode === 'date') {
    return formatPeriodLabel({ mode: 'date', date: filters.date });
  }

  if (filters.mode === 'month') {
    return formatPeriodLabel({ mode: 'month', year: filters.year, month: filters.month });
  }

  return formatPeriodLabel({
    mode: 'range',
    startDate: filters.startDate,
    endDate: filters.endDate,
  });
}

export function isCapacityListPeriodView(filters: CapacityListFilters): boolean {
  return filters.mode !== 'date';
}

export function getCapacityListWorkStatusTitle(
  filters: CapacityListFilters,
  periodLabel: string,
): string {
  if (filters.mode === 'date' && dayjs(filters.date).isSame(dayjs(), 'day')) {
    return 'Today';
  }

  if (filters.mode === 'date') {
    return periodLabel;
  }

  return 'Status';
}

export function buildCapacityListApiParams(filters: CapacityListFilters) {
  const shared = {
    ...(filters.department ? { department: filters.department } : {}),
    ...(filters.workStatus ? { workStatus: filters.workStatus } : {}),
  };

  if (filters.mode === 'date') {
    return { date: filters.date, ...shared };
  }

  if (filters.mode === 'range') {
    return { startDate: filters.startDate, endDate: filters.endDate, ...shared };
  }

  return { year: filters.year, month: filters.month, ...shared };
}

export function resolveCapacityListAnchorDate(filters: CapacityListFilters): dayjs.Dayjs {
  if (filters.mode === 'date') {
    return dayjs(filters.date);
  }

  if (filters.mode === 'range') {
    const start = dayjs(filters.startDate);
    const end = dayjs(filters.endDate);
    const today = dayjs();
    if (!today.isBefore(start, 'day') && !today.isAfter(end, 'day')) {
      return today;
    }
    return start;
  }

  const monthStart = dayjs().year(filters.year).month(filters.month - 1).startOf('month');
  const monthEnd = monthStart.endOf('month');
  const today = dayjs();
  if (!today.isBefore(monthStart, 'day') && !today.isAfter(monthEnd, 'day')) {
    return today;
  }
  return monthEnd;
}

export function countWeekdaysInRange(startDate: string, endDate: string): number {
  let count = 0;
  for (
    let cursor = dayjs(startDate);
    !cursor.isAfter(dayjs(endDate), 'day');
    cursor = cursor.add(1, 'day')
  ) {
    const day = cursor.day();
    if (day !== 0 && day !== 6) {
      count += 1;
    }
  }
  return count;
}
