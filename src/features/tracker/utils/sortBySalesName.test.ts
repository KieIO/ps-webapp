import { describe, expect, it } from 'vitest';
import { sortProjectsBySalesName } from './sortBySalesName';

const row = (id: string, salesName?: string) => ({ id, salesName });

describe('sortProjectsBySalesName', () => {
  it('sorts A→Z by Sales and keeps blanks at the end', () => {
    const sorted = sortProjectsBySalesName([
      row('1', 'Lan'),
      row('2'),
      row('3', 'Anh'),
      row('4', '  '),
      row('5', 'Bình'),
    ]);
    expect(sorted.map((item) => item.id)).toEqual(['3', '5', '1', '2', '4']);
  });

  it('is stable for equal Sales names', () => {
    const sorted = sortProjectsBySalesName([row('a', 'Lan'), row('b', 'Lan'), row('c', 'Anh')]);
    expect(sorted.map((item) => item.id)).toEqual(['c', 'a', 'b']);
  });
});
