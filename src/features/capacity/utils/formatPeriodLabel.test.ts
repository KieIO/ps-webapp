import { describe, expect, it } from 'vitest';
import { formatPeriodLabel } from './formatPeriodLabel';

describe('formatPeriodLabel', () => {
  it('formats date mode', () => {
    expect(formatPeriodLabel({ mode: 'date', date: '2026-06-13' })).toBe('13/06/2026');
  });

  it('formats month mode', () => {
    expect(formatPeriodLabel({ mode: 'month', year: 2026, month: 6 })).toBe('June 2026');
  });

  it('formats range mode', () => {
    expect(
      formatPeriodLabel({
        mode: 'range',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
      }),
    ).toBe('01/06/2026 – 30/06/2026');
  });

  it('formats single-day range as one date', () => {
    expect(
      formatPeriodLabel({
        mode: 'range',
        startDate: '2026-06-15',
        endDate: '2026-06-15',
      }),
    ).toBe('15/06/2026');
  });
});
