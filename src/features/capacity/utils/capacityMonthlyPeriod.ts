import dayjs from 'dayjs';
import type {
  CapacityMonthlyDay,
  CapacityMonthlyFilters,
  CapacityMonthlyResponse,
} from '../schemas/capacityMonthly.schema';
import { formatPeriodLabel } from './formatPeriodLabel';

export function formatCapacityPeriodLabel(
  response: Pick<CapacityMonthlyResponse, 'startDate' | 'endDate' | 'year' | 'month'>,
  filters: CapacityMonthlyFilters,
): string {
  if (filters.mode === 'month') {
    return formatPeriodLabel({ mode: 'month', year: response.year, month: response.month });
  }

  return formatPeriodLabel({
    mode: 'range',
    startDate: response.startDate,
    endDate: response.endDate,
  });
}

export function spansMultipleMonths(days: CapacityMonthlyDay[]): boolean {
  if (days.length <= 1) return false;
  const first = dayjs(days[0].date);
  const last = dayjs(days[days.length - 1].date);
  return !first.isSame(last, 'month');
}

export function getCapacityDayLabel(day: CapacityMonthlyDay, multiMonth: boolean): string {
  if (multiMonth) {
    return dayjs(day.date).format('DD/MM');
  }
  return String(day.dayOfMonth).padStart(2, '0');
}

export function buildCapacityMonthlyApiParams(filters: CapacityMonthlyFilters) {
  if (filters.mode === 'range') {
    return { startDate: filters.startDate, endDate: filters.endDate };
  }
  return { year: filters.year, month: filters.month };
}
