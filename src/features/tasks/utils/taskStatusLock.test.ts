import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { canCancelTask, canDeleteTask } from './taskStatusLock';

describe('canDeleteTask', () => {
  it('denies employees', () => {
    expect(canDeleteTask(ROLES.EMPLOYEE)).toBe(false);
  });

  it('allows PM and above', () => {
    expect(canDeleteTask(ROLES.PM)).toBe(true);
    expect(canDeleteTask(ROLES.CREATIVE_MANAGER)).toBe(true);
    expect(canDeleteTask(ROLES.ADMIN)).toBe(true);
  });
});

describe('canCancelTask', () => {
  it('denies employees', () => {
    expect(canCancelTask(ROLES.EMPLOYEE)).toBe(false);
  });
});
