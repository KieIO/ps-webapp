import type { CapacityMonthlyDay, CapacityMonthlyRowKey } from '../schemas/capacityMonthly.schema';
import { CAPACITY_MONTHLY_ROW_KEYS } from '../schemas/capacityMonthly.schema';
import { CAPACITY_MONTHLY_ROW_LABELS } from '../constants';
import { getCapacityDayLabel, spansMultipleMonths } from './capacityMonthlyPeriod';

export const CAPACITY_MONTHLY_CHART_COLORS: Record<CapacityMonthlyRowKey, string> = {
  total: '#0f766e',
  project: '#2563eb',
  creative_hcm: '#c2410c',
  creative_ag: '#7c3aed',
};

export interface CapacityMonthlyChartPoint {
  date: string;
  dayLabel: string;
  isWeekend: boolean;
  total: number;
  project: number;
  creative_hcm: number;
  creative_ag: number;
}

export function buildCapacityMonthlyChartData(
  days: CapacityMonthlyDay[],
): CapacityMonthlyChartPoint[] {
  const multiMonth = spansMultipleMonths(days);
  return days.map((day) => ({
    date: day.date,
    dayLabel: getCapacityDayLabel(day, multiMonth),
    isWeekend: day.isWeekend,
    total: day.capacity.total,
    project: day.capacity.project,
    creative_hcm: day.capacity.creative_hcm,
    creative_ag: day.capacity.creative_ag,
  }));
}

export const CAPACITY_CHART_SERIES = CAPACITY_MONTHLY_ROW_KEYS.map((key) => ({
  key,
  label: CAPACITY_MONTHLY_ROW_LABELS[key],
  color: CAPACITY_MONTHLY_CHART_COLORS[key],
}));

export function getCapacityChartYMax(points: CapacityMonthlyChartPoint[]): number {
  const peak = points.reduce((max, point) => {
    const dayMax = CAPACITY_MONTHLY_ROW_KEYS.reduce(
      (innerMax, key) => Math.max(innerMax, point[key]),
      0,
    );
    return Math.max(max, dayMax);
  }, 0);

  if (peak <= 100) return 100;
  return Math.ceil(peak / 10) * 10;
}
