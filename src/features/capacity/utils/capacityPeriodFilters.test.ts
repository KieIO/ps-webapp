import { describe, expect, it } from 'vitest';
import { applyCapacityListPeriodChange } from './capacityPeriodFilters';
import { buildCapacityListApiParams, formatCapacityListPeriodLabel } from './capacityListPeriod';

describe('applyCapacityListPeriodChange', () => {
  it('switches to range without keeping a hidden snapshot date', () => {
    const next = applyCapacityListPeriodChange(
      {
        mode: 'month',
        year: 2026,
        month: 6,
      },
      {
        mode: 'range',
        startDate: '2026-06-01',
        endDate: '2026-06-15',
      },
    );

    expect(next).toEqual({
      mode: 'range',
      startDate: '2026-06-01',
      endDate: '2026-06-15',
    });
  });

  it('switches to date mode', () => {
    const next = applyCapacityListPeriodChange(
      {
        mode: 'range',
        startDate: '2026-06-01',
        endDate: '2026-06-15',
      },
      {
        mode: 'date',
        date: '2026-06-13',
      },
    );

    expect(next).toEqual({
      mode: 'date',
      date: '2026-06-13',
    });
  });
});

describe('formatCapacityListPeriodLabel', () => {
  it('formats month mode', () => {
    expect(
      formatCapacityListPeriodLabel({
        mode: 'month',
        year: 2026,
        month: 6,
      }),
    ).toBe('June 2026');
  });

  it('formats range mode', () => {
    expect(
      formatCapacityListPeriodLabel({
        mode: 'range',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
      }),
    ).toBe('01/06/2026 – 30/06/2026');
  });
});

describe('buildCapacityListApiParams', () => {
  it('uses period params for month mode', () => {
    expect(
      buildCapacityListApiParams({
        mode: 'month',
        year: 2026,
        month: 6,
      }),
    ).toEqual({ year: 2026, month: 6 });
  });
});
