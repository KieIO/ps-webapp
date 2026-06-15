import { describe, expect, it } from 'vitest';
import { countWeekdaysInRange } from './capacityListPeriod';

describe('countWeekdaysInRange', () => {
  it('counts weekdays only', () => {
    expect(countWeekdaysInRange('2026-06-01', '2026-06-07')).toBe(5);
  });
});
