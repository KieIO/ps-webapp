import dayjs from 'dayjs';
import { mockDelay } from '@/shared/mock/mockDelay';
import { INITIAL_MOCK_CAPACITY } from './capacity.data';
import { computeAverageCapacityPercent } from '../utils/averageCapacity';
import type {
  CapacityMonthlyDay,
  CapacityMonthlyFilters,
  CapacityMonthlyResponse,
  CapacityMonthlyRowKey,
} from '../schemas/capacityMonthly.schema';
import { CAPACITY_MONTHLY_ROW_KEYS } from '../schemas/capacityMonthly.schema';
import type { EmployeeCapacity } from '../schemas/capacity.schema';

const hashSeed = (input: string) =>
  [...input].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);

const applyDateSnapshot = (items: EmployeeCapacity[], date: string): EmployeeCapacity[] => {
  const today = dayjs().format('YYYY-MM-DD');
  if (date === today) return items;

  const isWeekend = [0, 6].includes(dayjs(date).day());
  if (isWeekend) {
    return items.map((item) => ({ ...item, workStatus: 'off' as const, capacityPercent: null }));
  }

  return items.map((item) => {
    const seed = Math.abs(hashSeed(`${item.id}:${date}`));
    const workStatus = seed % 14 === 0 ? ('off' as const) : ('working' as const);
    if (workStatus === 'off') {
      return { ...item, workStatus, capacityPercent: null };
    }
    const base = item.capacityPercent ?? 60;
    const capacityPercent = Math.min(130, Math.max(0, base + (seed % 31) - 15));
    return { ...item, workStatus, capacityPercent };
  });
};

const computeDepartmentPercent = (
  items: EmployeeCapacity[],
  department?: CapacityMonthlyRowKey,
): number => {
  const filtered =
    department && department !== 'total'
      ? items.filter((item) => item.department === department)
      : items;
  return computeAverageCapacityPercent(filtered);
};

const computeDepartmentSlides = (
  items: EmployeeCapacity[],
  date: string,
  department?: CapacityMonthlyRowKey,
): number => {
  const filtered =
    department && department !== 'total'
      ? items.filter((item) => item.department === department)
      : items;

  return filtered.reduce((sum, item) => {
    if (item.workStatus !== 'working') return sum;
    const seed = Math.abs(hashSeed(`slides:${item.id}:${date}`));
    const dailySlides = 4 + (seed % 12);
    return sum + dailySlides;
  }, 0);
};

const buildMockDay = (date: string): CapacityMonthlyDay => {
  const parsed = dayjs(date);
  const isWeekend = [0, 6].includes(parsed.day());
  const snapshot = applyDateSnapshot(INITIAL_MOCK_CAPACITY, date);

  const capacity = CAPACITY_MONTHLY_ROW_KEYS.reduce(
    (acc, key) => {
      acc[key] = isWeekend ? 0 : computeDepartmentPercent(snapshot, key);
      return acc;
    },
    {} as Record<CapacityMonthlyRowKey, number>,
  );

  const slides = CAPACITY_MONTHLY_ROW_KEYS.reduce(
    (acc, key) => {
      acc[key] = isWeekend ? 0 : computeDepartmentSlides(snapshot, date, key);
      return acc;
    },
    {} as Record<CapacityMonthlyRowKey, number>,
  );

  return {
    date,
    dayOfMonth: parsed.date(),
    isWeekend,
    hasData: capacity.total > 0,
    hasSlidesData: slides.total > 0,
    capacity,
    slides,
  };
};

const resolveMockRange = (filters: CapacityMonthlyFilters) => {
  if (filters.mode === 'range') {
    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
      year: dayjs(filters.startDate).year(),
      month: dayjs(filters.startDate).month() + 1,
    };
  }

  const start = dayjs().year(filters.year).month(filters.month - 1).startOf('month');
  const end = start.endOf('month');
  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
    year: filters.year,
    month: filters.month,
  };
};

export const mockGetCapacityMonthly = async (
  filters: CapacityMonthlyFilters,
): Promise<CapacityMonthlyResponse> => {
  await mockDelay();
  const { startDate, endDate, year, month } = resolveMockRange(filters);

  const days: CapacityMonthlyDay[] = [];
  let cursor = dayjs(startDate);
  const last = dayjs(endDate);

  while (cursor.isBefore(last) || cursor.isSame(last, 'day')) {
    days.push(buildMockDay(cursor.format('YYYY-MM-DD')));
    cursor = cursor.add(1, 'day');
  }

  const totalSlides = days.reduce((sum, day) => sum + day.slides.total, 0);
  const workingDays = days.filter((day) => !day.isWeekend).length;
  const daysWithSlides = days.filter((day) => day.slides.total > 0).length;

  return {
    startDate,
    endDate,
    year,
    month,
    summary: {
      totalProjects: Math.min(12, Math.max(1, daysWithSlides * 2)),
      totalSlides,
      workingDays,
      dayCount: days.length,
    },
    days,
  };
};
