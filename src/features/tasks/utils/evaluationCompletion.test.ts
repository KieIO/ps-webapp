import { describe, expect, it } from 'vitest';
import {
  computeCompletionPercentFromQuantity,
  deriveCompletedQuantityFromPercent,
  formatCompletionPercentDisplay,
} from './evaluationCompletion';

describe('computeCompletionPercentFromQuantity', () => {
  it('maps completed / assigned to a percent', () => {
    expect(computeCompletionPercentFromQuantity(5, 10)).toBe(50);
    expect(computeCompletionPercentFromQuantity(10, 10)).toBe(100);
    expect(computeCompletionPercentFromQuantity(0, 10)).toBe(0);
  });

  it('clamps to 0–100 and handles zero assigned quantity', () => {
    expect(computeCompletionPercentFromQuantity(12, 10)).toBe(100);
    expect(computeCompletionPercentFromQuantity(-1, 10)).toBe(0);
    expect(computeCompletionPercentFromQuantity(5, 0)).toBe(0);
  });

  it('keeps fractional percents so quantity can round-trip', () => {
    expect(computeCompletionPercentFromQuantity(1, 3)).toBeCloseTo(100 / 3, 10);
    expect(computeCompletionPercentFromQuantity(2, 3)).toBeCloseTo(200 / 3, 10);
  });

  it('keeps partial acceptance vs original assigned after remainder spawn (e.g. 9/12)', () => {
    expect(computeCompletionPercentFromQuantity(9, 12)).toBe(75);
    expect(computeCompletionPercentFromQuantity(3, 8)).toBe(37.5);
  });

  it('round-trips nearby quantities that share the same integer percent', () => {
    for (const accepted of [17, 18]) {
      const percent = computeCompletionPercentFromQuantity(accepted, 117);
      expect(Math.round(percent)).toBe(15);
      expect(deriveCompletedQuantityFromPercent(percent, 117)).toBe(accepted);
    }
  });
});

describe('deriveCompletedQuantityFromPercent', () => {
  it('derives completed units from a stored percent', () => {
    expect(deriveCompletedQuantityFromPercent(50, 10)).toBe(5);
    expect(deriveCompletedQuantityFromPercent(100, 20)).toBe(20);
    expect(deriveCompletedQuantityFromPercent(0, 10)).toBe(0);
    expect(deriveCompletedQuantityFromPercent(68, 20)).toBe(14);
  });

  it('returns 0 when percent or quantity is missing / invalid', () => {
    expect(deriveCompletedQuantityFromPercent(null, 10)).toBe(0);
    expect(deriveCompletedQuantityFromPercent(undefined, 10)).toBe(0);
    expect(deriveCompletedQuantityFromPercent(50, 0)).toBe(0);
  });
});

describe('formatCompletionPercentDisplay', () => {
  it('shows a whole-number percent for UI', () => {
    expect(formatCompletionPercentDisplay(14.529)).toBe('15%');
    expect(formatCompletionPercentDisplay(null)).toBe('—');
  });
});
