import { describe, expect, it } from 'vitest';
import { titlesForSelect } from './titlesForSelect';

const titles = [
  { id: 'jpe-1', jobLevelId: 'lvl-junior', code: 'JPE-1' },
  { id: 'pm-1', jobLevelId: 'lvl-manager', code: 'PM-1' },
  { id: 'jgd-1', jobLevelId: 'lvl-junior', code: 'JGD-1' },
];

describe('titlesForSelect', () => {
  it('returns all titles when no level selected', () => {
    expect(titlesForSelect(titles, undefined, undefined).map((t) => t.id)).toEqual([
      'jpe-1',
      'pm-1',
      'jgd-1',
    ]);
  });

  it('filters by selected job level', () => {
    expect(titlesForSelect(titles, 'lvl-junior', undefined).map((t) => t.id)).toEqual([
      'jpe-1',
      'jgd-1',
    ]);
  });

  it('keeps currently selected title even if outside level filter', () => {
    expect(titlesForSelect(titles, 'lvl-junior', 'pm-1').map((t) => t.id)).toEqual([
      'pm-1',
      'jpe-1',
      'jgd-1',
    ]);
  });
});
