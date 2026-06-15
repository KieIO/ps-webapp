import type { CapacityMonthlyFilters } from '../schemas/capacityMonthly.schema';
import type { CapacityListFilters } from '../schemas/capacity.schema';

export type CapacityListPeriodValue = CapacityMonthlyFilters | { mode: 'date'; date: string };

export function getCapacityListPeriod(filters: CapacityListFilters): CapacityListPeriodValue {
  if (filters.mode === 'date') {
    return { mode: 'date', date: filters.date };
  }

  if (filters.mode === 'range') {
    return {
      mode: 'range',
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
  }

  return {
    mode: 'month',
    year: filters.year,
    month: filters.month,
  };
}

export function applyCapacityListPeriodChange(
  filters: CapacityListFilters,
  period: CapacityListPeriodValue,
): CapacityListFilters {
  const shared = {
    department: filters.department,
    workStatus: filters.workStatus,
  };

  if (period.mode === 'date') {
    return {
      ...shared,
      mode: 'date',
      date: period.date,
    };
  }

  if (period.mode === 'range') {
    return {
      ...shared,
      mode: 'range',
      startDate: period.startDate,
      endDate: period.endDate,
    };
  }

  return {
    ...shared,
    mode: 'month',
    year: period.year,
    month: period.month,
  };
}
