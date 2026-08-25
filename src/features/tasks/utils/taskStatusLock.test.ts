import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { canCancelTask, canDeleteTask, canEditTask } from './taskStatusLock';

describe('canEditTask', () => {
  it('denies employees', () => {
    expect(canEditTask(ROLES.EMPLOYEE)).toBe(false);
  });

  it('allows PM and above', () => {
    expect(canEditTask(ROLES.PM)).toBe(true);
    expect(canEditTask(ROLES.CREATIVE_MANAGER)).toBe(true);
    expect(canEditTask(ROLES.HEAD)).toBe(true);
    expect(canEditTask(ROLES.ADMIN)).toBe(true);
  });
});

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
