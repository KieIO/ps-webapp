import { describe, expect, it } from 'vitest';
import { slugifyDepartmentCode } from './slugifyDepartmentCode';

describe('slugifyDepartmentCode', () => {
  it('lowercases and replaces non-alphanumeric with underscores', () => {
    expect(slugifyDepartmentCode('E2E QA Dept')).toBe('e2e_qa_dept');
  });

  it('trims edges and collapses separators', () => {
    expect(slugifyDepartmentCode('  Hello---World  ')).toBe('hello_world');
  });

  it('prefixes when slug would not start with a letter', () => {
    expect(slugifyDepartmentCode('2026 Ops')).toBe('d_2026_ops');
  });

  it('falls back when name has no usable characters', () => {
    expect(slugifyDepartmentCode('@@@')).toBe('department');
  });
});
