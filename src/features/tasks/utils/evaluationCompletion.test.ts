import { describe, expect, it } from 'vitest';
import {
  computeCompletionPercentFromQuantity,
  deriveCompletedQuantityFromPercent,
} from './evaluationCompletion';

describe('computeCompletionPercentFromQuantity', () => {
  it('maps completed / assigned to a rounded percent', () => {
    expect(computeCompletionPercentFromQuantity(5, 10)).toBe(50);
    expect(computeCompletionPercentFromQuantity(10, 10)).toBe(100);
    expect(computeCompletionPercentFromQuantity(0, 10)).toBe(0);
  });

  it('clamps to 0–100 and handles zero assigned quantity', () => {
    expect(computeCompletionPercentFromQuantity(12, 10)).toBe(100);
    expect(computeCompletionPercentFromQuantity(-1, 10)).toBe(0);
    expect(computeCompletionPercentFromQuantity(5, 0)).toBe(0);
  });

  it('rounds fractional percents', () => {
    expect(computeCompletionPercentFromQuantity(1, 3)).toBe(33);
    expect(computeCompletionPercentFromQuantity(2, 3)).toBe(67);
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
