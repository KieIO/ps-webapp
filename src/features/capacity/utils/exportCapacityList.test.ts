import { describe, expect, it } from 'vitest';
import type { EmployeeCapacity } from '../schemas/capacity.schema';
import { CAPACITY_LIST_EXPORT_HEADERS, buildCapacityListExportRows } from './exportCapacityList';

const sampleItem = (overrides: Partial<EmployeeCapacity> = {}): EmployeeCapacity => ({
  id: 'u1',
  name: 'Minh',
  department: 'project',
  jobLevel: 'senior',
  positionCode: 'DES-01',
  jobTitleName: 'Designer',
  workStatus: 'working',
  dailyCapacityPoints: 980,
  specialistTaskPoints: 120,
  achievedTaskPoints: 540,
  capacityPercent: 55,
  ...overrides,
});

describe('buildCapacityListExportRows', () => {
  it('maps employee capacity rows with labels', () => {
    const [row] = buildCapacityListExportRows([sampleItem()], '08/09/2026');
    expect([...CAPACITY_LIST_EXPORT_HEADERS]).toEqual(
      expect.arrayContaining(['Employee', 'Capacity (%)', 'Period']),
    );
    expect(row).toEqual([
      'Minh',
      'PROJECT',
      'Senior',
      'DES-01',
      'Designer',
      120,
      540,
      980,
      'Working',
      55,
      '08/09/2026',
    ]);
  });

  it('leaves capacity blank when employee is off', () => {
    const [row] = buildCapacityListExportRows(
      [sampleItem({ workStatus: 'off', capacityPercent: null })],
      'Tháng 9/2026',
    );
    expect(row[8]).toBe('Off');
    expect(row[9]).toBe('');
  });
});
