import { describe, expect, it } from 'vitest';
import {
  buildArchivedProjectNameKeys,
  filterOutArchivedProjectNames,
  isArchivedProjectName,
} from './archivedProjectNames';

describe('archivedProjectNames', () => {
  const keys = buildArchivedProjectNameKeys([{ name: 'christmas' }, { name: '  Old Proj  ' }]);

  it('builds case-insensitive keys', () => {
    expect(keys.has('christmas')).toBe(true);
    expect(keys.has('old proj')).toBe(true);
  });

  it('detects archived free-text', () => {
    expect(isArchivedProjectName('Christmas', keys)).toBe(true);
    expect(isArchivedProjectName('active-new', keys)).toBe(false);
  });

  it('filters historic option lists', () => {
    expect(filterOutArchivedProjectNames(['Alpha', 'christmas', 'Beta'], keys)).toEqual([
      'Alpha',
      'Beta',
    ]);
  });
});
