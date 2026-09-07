import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { canCancelTask, canDeleteTask, canEditTask } from './taskStatusLock';

describe('canEditTask', () => {
  it('denies employees and creative managers', () => {
    expect(canEditTask(ROLES.EMPLOYEE)).toBe(false);
    expect(canEditTask(ROLES.CREATIVE_MANAGER)).toBe(false);
  });

  it('allows PM and above (except CM)', () => {
    expect(canEditTask(ROLES.PM)).toBe(true);
    expect(canEditTask(ROLES.CREATIVE_HEAD)).toBe(true);
    expect(canEditTask(ROLES.HEAD)).toBe(true);
    expect(canEditTask(ROLES.ADMIN)).toBe(true);
  });
});

describe('canDeleteTask', () => {
  it('denies employees and creative managers', () => {
    expect(canDeleteTask(ROLES.EMPLOYEE)).toBe(false);
    expect(canDeleteTask(ROLES.CREATIVE_MANAGER)).toBe(false);
  });

  it('allows PM and above (except CM)', () => {
    expect(canDeleteTask(ROLES.PM)).toBe(true);
    expect(canDeleteTask(ROLES.CREATIVE_HEAD)).toBe(true);
    expect(canDeleteTask(ROLES.ADMIN)).toBe(true);
  });
});

describe('canCancelTask', () => {
  it('denies employees', () => {
    expect(canCancelTask(ROLES.EMPLOYEE)).toBe(false);
  });
});
