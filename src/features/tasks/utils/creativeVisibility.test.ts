import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import {
  canEditCreativeDeadline,
  canEditCreativeDeadlineMeta,
  canEditCreativeScheduleMeta,
  canViewCreativeDeadline,
} from './creativeVisibility';

describe('creativeVisibility', () => {
  it('allows creative roles and Admin/PM to view creative deadline', () => {
    expect(canViewCreativeDeadline(ROLES.CREATIVE_HEAD, 'creative_hcm')).toBe(true);
    expect(canViewCreativeDeadline(ROLES.CREATIVE_MANAGER, 'creative_hcm')).toBe(true);
    expect(canViewCreativeDeadline(ROLES.ADMIN, 'project')).toBe(true);
    expect(canViewCreativeDeadline(ROLES.PM, 'project')).toBe(true);
    expect(canViewCreativeDeadline(ROLES.EMPLOYEE, 'creative_hcm')).toBe(true);
    expect(canViewCreativeDeadline(ROLES.EMPLOYEE, 'creative_ag')).toBe(true);
  });

  it('denies employee outside creative departments for creative deadline view', () => {
    expect(canViewCreativeDeadline(ROLES.EMPLOYEE, 'project')).toBe(false);
  });

  it('allows Admin/PM schedule meta; CM may edit creative deadline only', () => {
    expect(canEditCreativeScheduleMeta(ROLES.ADMIN)).toBe(true);
    expect(canEditCreativeScheduleMeta(ROLES.PM)).toBe(true);
    expect(canEditCreativeScheduleMeta(ROLES.CREATIVE_MANAGER)).toBe(false);
    expect(canEditCreativeDeadline(ROLES.ADMIN)).toBe(true);
    expect(canEditCreativeDeadline(ROLES.PM)).toBe(true);
    expect(canEditCreativeDeadline(ROLES.CREATIVE_MANAGER)).toBe(true);
    expect(canEditCreativeDeadline(ROLES.CREATIVE_HEAD)).toBe(false);
    expect(canEditCreativeDeadline(ROLES.EMPLOYEE)).toBe(false);
  });

  it('gates Deadline Creative meta to Admin/Head/creator/project PM', () => {
    expect(canEditCreativeDeadlineMeta(ROLES.ADMIN, 'anyone', 'creator')).toBe(true);
    expect(canEditCreativeDeadlineMeta(ROLES.HEAD, 'anyone', 'creator')).toBe(true);
    expect(canEditCreativeDeadlineMeta(ROLES.PM, 'creator', 'creator')).toBe(true);
    expect(
      canEditCreativeDeadlineMeta(ROLES.PM, 'pm-1', {
        createdById: 'someone-else',
        projectManagerUserId: 'pm-1',
      }),
    ).toBe(true);
    expect(
      canEditCreativeDeadlineMeta(ROLES.PM, 'other', {
        createdById: 'creator',
        projectManagerUserId: 'pm-1',
      }),
    ).toBe(false);
    expect(canEditCreativeDeadlineMeta(ROLES.PM, 'pm-1', { createdById: null })).toBe(true);
    expect(canEditCreativeDeadlineMeta(ROLES.CREATIVE_MANAGER, 'creator', 'creator')).toBe(true);
    expect(canEditCreativeDeadlineMeta(ROLES.CREATIVE_MANAGER, 'other', 'creator')).toBe(false);
    expect(canEditCreativeDeadlineMeta(ROLES.CREATIVE_HEAD, 'creator', 'creator')).toBe(false);
  });
});
