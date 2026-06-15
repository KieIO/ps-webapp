import dayjs from 'dayjs';
import { mockDelay } from '@/shared/mock/mockDelay';
import type { CapacityListFilters, CapacityListResponse, EmployeeCapacity } from '../schemas/capacity.schema';
import { computeAverageCapacityPercent } from '../utils/averageCapacity';
import { countWeekdaysInRange } from '../utils/capacityListPeriod';
import { INITIAL_MOCK_CAPACITY } from './capacity.data';

const hashSeed = (input: string) =>
  [...input].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);

/** Vary snapshot by date so the date filter is visible in dev mock. */
const applyDateSnapshot = (items: EmployeeCapacity[], date: string): EmployeeCapacity[] => {
  const today = dayjs().format('YYYY-MM-DD');
  if (date === today) return items;

  const isWeekend = [0, 6].includes(dayjs(date).day());

  return items.map((item) => {
    const seed = Math.abs(hashSeed(`${item.id}:${date}`));

    if (isWeekend) {
      return { ...item, workStatus: 'off', capacityPercent: null };
    }

    const workStatus = seed % 14 === 0 ? 'off' : 'working';
    if (workStatus === 'off') {
      return { ...item, workStatus, capacityPercent: null };
    }

    const base = item.capacityPercent ?? 60;
    const capacityPercent = Math.min(130, Math.max(0, base + (seed % 31) - 15));

    return { ...item, workStatus, capacityPercent };
  });
};

const resolvePeriodBounds = (filters: CapacityListFilters) => {
  if (filters.mode === 'month') {
    const monthStart = dayjs().year(filters.year).month(filters.month - 1).startOf('month');
    return {
      startDate: monthStart.format('YYYY-MM-DD'),
      endDate: monthStart.endOf('month').format('YYYY-MM-DD'),
    };
  }

  if (filters.mode === 'range') {
    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
  }

  return {
    startDate: filters.date,
    endDate: filters.date,
  };
};

const applyPeriodSnapshot = (
  items: EmployeeCapacity[],
  filters: CapacityListFilters,
): EmployeeCapacity[] => {
  if (filters.mode === 'date') {
    return applyDateSnapshot(items, filters.date);
  }

  const { startDate, endDate } = resolvePeriodBounds(filters);
  const workingDays = countWeekdaysInRange(startDate, endDate);
  const dailySnapshot = applyDateSnapshot(items, startDate);

  return dailySnapshot.map((item) => {
    if (item.workStatus === 'off' || item.capacityPercent === null || workingDays === 0) {
      return { ...item, achievedTaskPoints: 0, capacityPercent: item.capacityPercent };
    }

    return {
      ...item,
      achievedTaskPoints: Math.round(item.achievedTaskPoints * workingDays * 0.65),
      capacityPercent: item.capacityPercent,
    };
  });
};

const filterCapacity = (items: EmployeeCapacity[], filters: CapacityListFilters) => {
  let result = applyPeriodSnapshot(items, filters);

  if (filters.department) {
    result = result.filter((item) => item.department === filters.department);
  }

  if (filters.workStatus) {
    result = result.filter((item) => item.workStatus === filters.workStatus);
  }

  return result;
};

export const mockGetCapacityList = async (
  filters: CapacityListFilters,
): Promise<CapacityListResponse> => {
  await mockDelay();
  const items = filterCapacity(INITIAL_MOCK_CAPACITY, filters);
  return {
    items,
    total: items.length,
    averageCapacityPercent: computeAverageCapacityPercent(items),
  };
};
