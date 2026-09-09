import { describe, expect, it } from 'vitest';
import type { CapacityMonthlyDay } from '../schemas/capacityMonthly.schema';
import {
  CAPACITY_MONTHLY_EXPORT_HEADERS,
  buildCapacityMonthlyExportRows,
} from './exportCapacityMonthly';

const sampleDay = (overrides: Partial<CapacityMonthlyDay> = {}): CapacityMonthlyDay => ({
  date: '2026-09-08',
  dayOfMonth: 8,
  isWeekend: false,
  hasData: true,
  hasSlidesData: true,
  capacity: { total: 72, project: 80, creative_hcm: 65, creative_ag: 60 },
  slides: { total: 120, project: 90, creative_hcm: 20, creative_ag: 10 },
  ...overrides,
});

describe('buildCapacityMonthlyExportRows', () => {
  it('maps day metrics into spreadsheet rows', () => {
    const [row] = buildCapacityMonthlyExportRows([sampleDay()]);
    expect([...CAPACITY_MONTHLY_EXPORT_HEADERS]).toEqual(
      expect.arrayContaining([
        'Date',
        'Capacity · POKESLIDE (%)',
        'Slides · PROJECT',
        'Capacity · CREATIVE HCM (%)',
      ]),
    );
    expect(row).toEqual(['08/09/2026', 8, 'No', 'Yes', 'Yes', 72, 120, 65, 20, 80, 90, 60, 10]);
  });

  it('flags weekends and empty metric days', () => {
    const [row] = buildCapacityMonthlyExportRows([
      sampleDay({
        date: '2026-09-06',
        dayOfMonth: 6,
        isWeekend: true,
        hasData: false,
        hasSlidesData: false,
        capacity: { total: 0, project: 0, creative_hcm: 0, creative_ag: 0 },
        slides: { total: 0, project: 0, creative_hcm: 0, creative_ag: 0 },
      }),
    ]);
    expect(row.slice(0, 5)).toEqual(['06/09/2026', 6, 'Yes', 'No', 'No']);
  });
});
