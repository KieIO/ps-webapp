import { describe, expect, it } from 'vitest';
import { isPositiveWholeQuantity } from './taskQuantity';

describe('isPositiveWholeQuantity', () => {
  it('accepts positive integers', () => {
    expect(isPositiveWholeQuantity(1)).toBe(true);
    expect(isPositiveWholeQuantity(30)).toBe(true);
  });

  it('rejects zero, decimals, and non-numbers', () => {
    expect(isPositiveWholeQuantity(0)).toBe(false);
    expect(isPositiveWholeQuantity(1.01)).toBe(false);
    expect(isPositiveWholeQuantity(0.01)).toBe(false);
    expect(isPositiveWholeQuantity(-2)).toBe(false);
    expect(isPositiveWholeQuantity('1')).toBe(false);
  });
});
