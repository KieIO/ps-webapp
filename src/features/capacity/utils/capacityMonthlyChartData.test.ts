import { describe, expect, it } from 'vitest';
import {
  buildCapacityMonthlyChartData,
  getCapacityChartYMax,
} from './capacityMonthlyChartData';
import type { CapacityMonthlyDay } from '../schemas/capacityMonthly.schema';

const sampleDay = (day: number, total: number): CapacityMonthlyDay => ({
  date: `2026-06-${String(day).padStart(2, '0')}`,
  dayOfMonth: day,
  isWeekend: false,
  hasData: total > 0,
  hasSlidesData: false,
  capacity: {
    total,
    project: total - 5,
    creative_hcm: 10,
    creative_ag: 0,
  },
  slides: {
    total: 0,
    project: 0,
    creative_hcm: 0,
    creative_ag: 0,
  },
});

describe('buildCapacityMonthlyChartData', () => {
  it('maps table capacity values to chart points', () => {
    const points = buildCapacityMonthlyChartData([sampleDay(13, 32)]);

    expect(points).toHaveLength(1);
    expect(points[0]).toMatchObject({
      dayLabel: '13',
      total: 32,
      project: 27,
      creative_hcm: 10,
    });
  });
});

describe('getCapacityChartYMax', () => {
  it('caps at 100 when peak is below target', () => {
    expect(getCapacityChartYMax(buildCapacityMonthlyChartData([sampleDay(1, 32)]))).toBe(100);
  });

  it('extends axis when capacity exceeds 100%', () => {
    expect(getCapacityChartYMax(buildCapacityMonthlyChartData([sampleDay(1, 125)]))).toBe(130);
  });
});
