import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { canEditProjectMeta } from './projectEditAuth';

describe('canEditProjectMeta', () => {
  const base = {
    status: 'in_progress' as const,
    archivedAt: undefined as string | undefined,
    createdById: 'usr-creator',
  };

  it('allows Admin on finish/cancel; locks other roles', () => {
    expect(canEditProjectMeta({ ...base, status: 'finish' }, ROLES.ADMIN, 'anyone')).toBe(true);
    expect(canEditProjectMeta({ ...base, status: 'cancel' }, ROLES.ADMIN, 'anyone')).toBe(true);
    expect(canEditProjectMeta({ ...base, status: 'finish' }, ROLES.HEAD, 'anyone')).toBe(false);
    expect(canEditProjectMeta({ ...base, status: 'finish' }, ROLES.PM, 'usr-creator')).toBe(false);
  });

  it('keeps archived locked even for Admin', () => {
    expect(
      canEditProjectMeta({ ...base, archivedAt: '2026-01-01T00:00:00Z' }, ROLES.ADMIN, 'anyone'),
    ).toBe(false);
  });

  it('allows PM and Head on active projects (tracker timeline)', () => {
    expect(canEditProjectMeta(base, ROLES.PM, 'anyone')).toBe(true);
    expect(canEditProjectMeta(base, ROLES.HEAD, 'anyone')).toBe(true);
    expect(canEditProjectMeta(base, ROLES.EMPLOYEE, 'usr-creator')).toBe(true);
    expect(canEditProjectMeta(base, ROLES.EMPLOYEE, 'other')).toBe(false);
  });
});
