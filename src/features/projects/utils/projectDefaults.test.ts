import { describe, expect, it } from 'vitest';
import { DEFAULT_PROJECT_DEPARTMENT, resolveCreateDepartment } from './projectDefaults';

describe('resolveCreateDepartment', () => {
  it('prefers the project seed code when present', () => {
    expect(resolveCreateDepartment(['creative', 'project', 'admin'])).toBe(
      DEFAULT_PROJECT_DEPARTMENT,
    );
  });

  it('falls back to the first catalog code', () => {
    expect(resolveCreateDepartment(['creative', 'admin'])).toBe('creative');
  });

  it('returns undefined when the catalog is empty', () => {
    expect(resolveCreateDepartment([])).toBeUndefined();
  });
});
