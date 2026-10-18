import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import {
  canCancelTask,
  canDeleteTask,
  canEditTask,
  canEditTaskMeta,
  canOpenTaskMetaEdit,
  TASK_META_EDIT_STATUS_LOCKED_MESSAGE,
} from './taskStatusLock';

describe('canEditTaskMeta', () => {
  const base = {
    staffConfirmation: 'confirmed' as const,
    createdById: 'usr-creator',
  };

  it('allows Admin, Head, PM, and creator after confirm', () => {
    expect(canEditTaskMeta(base, ROLES.ADMIN, 'anyone')).toBe(true);
    expect(canEditTaskMeta(base, ROLES.HEAD, 'anyone')).toBe(true);
    expect(canEditTaskMeta(base, ROLES.PM, 'usr-creator')).toBe(true);
    expect(canEditTaskMeta(base, ROLES.PM, 'other')).toBe(true);
  });

  it('allows Admin on finished/cancelled; locks other roles', () => {
    expect(canEditTaskMeta({ ...base, staffConfirmation: 'finished' }, ROLES.ADMIN, 'anyone')).toBe(
      true,
    );
    expect(
      canEditTaskMeta({ ...base, staffConfirmation: 'cancelled' }, ROLES.ADMIN, 'anyone'),
    ).toBe(true);
    expect(
      canEditTaskMeta({ ...base, staffConfirmation: 'finished' }, ROLES.PM, 'usr-creator'),
    ).toBe(false);
  });

  it('allows creator CH when not Admin/Head/PM', () => {
    expect(canEditTaskMeta(base, ROLES.CREATIVE_HEAD, 'usr-creator')).toBe(true);
    expect(canEditTaskMeta(base, ROLES.CREATIVE_HEAD, 'other')).toBe(false);
  });
});

describe('canOpenTaskMetaEdit', () => {
  const base = {
    staffConfirmation: 'confirmed' as const,
    createdById: 'usr-creator',
  };

  it('still opens for PM/Head/creator when finished (read-only)', () => {
    const finished = { ...base, staffConfirmation: 'finished' as const };
    expect(canOpenTaskMetaEdit(finished, ROLES.PM, 'other')).toBe(true);
    expect(canOpenTaskMetaEdit(finished, ROLES.HEAD, 'anyone')).toBe(true);
    expect(canOpenTaskMetaEdit(finished, ROLES.CREATIVE_HEAD, 'usr-creator')).toBe(true);
    expect(canOpenTaskMetaEdit(finished, ROLES.CREATIVE_HEAD, 'other')).toBe(false);
    expect(canOpenTaskMetaEdit(finished, ROLES.EMPLOYEE, 'usr-creator')).toBe(true);
  });

  it('describes status lock for banners', () => {
    expect(TASK_META_EDIT_STATUS_LOCKED_MESSAGE('finished')).toContain('Hoàn thành');
    expect(TASK_META_EDIT_STATUS_LOCKED_MESSAGE('cancelled')).toContain('Hủy');
  });
});

describe('canEditTask (legacy role-only)', () => {
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
