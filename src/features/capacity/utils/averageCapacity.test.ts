import { describe, expect, it } from 'vitest';
import { computeSpecialistTaskPoints } from '@/features/titles/utils/capacityFormula';
import type { EmployeeCapacity } from '../schemas/capacity.schema';
import { computeAverageCapacityPercent } from './averageCapacity';

const working = (
  capacityPercent: number,
  dailyCapacityPoints: number,
): EmployeeCapacity => ({
  id: '1',
  name: 'Test',
  department: 'project',
  jobLevel: 'junior',
  positionCode: 'JR-1',
  jobTitleName: 'Junior Level 1',
  workStatus: 'working',
  dailyCapacityPoints,
  specialistTaskPoints: computeSpecialistTaskPoints(dailyCapacityPoints, 100),
  achievedTaskPoints: 0,
  capacityPercent,
});

describe('computeAverageCapacityPercent', () => {
  it('uses weighted average, not simple mean', () => {
    const items = [
      working(100, 200),
      working(50, 50),
    ];

    expect(computeAverageCapacityPercent(items)).toBe(90);
  });

  it('excludes off employees', () => {
    const items: EmployeeCapacity[] = [
      working(80, 100),
      {
        ...working(0, 100),
        workStatus: 'off',
        capacityPercent: null,
      },
    ];

    expect(computeAverageCapacityPercent(items)).toBe(80);
  });

  it('returns 0 when no working employees', () => {
    expect(computeAverageCapacityPercent([])).toBe(0);
  });
});
