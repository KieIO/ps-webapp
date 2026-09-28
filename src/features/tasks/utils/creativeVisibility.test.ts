import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import {
  canEditCreativeDeadline,
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
});
