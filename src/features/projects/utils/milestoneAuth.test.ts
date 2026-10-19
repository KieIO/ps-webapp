import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { canManageProjectMilestones } from './milestoneAuth';

describe('canManageProjectMilestones', () => {
  it('allows PM, creative manager, head, and admin', () => {
    expect(canManageProjectMilestones(ROLES.ADMIN)).toBe(true);
    expect(canManageProjectMilestones(ROLES.HEAD)).toBe(true);
    expect(canManageProjectMilestones(ROLES.PM)).toBe(true);
    expect(canManageProjectMilestones(ROLES.CREATIVE_MANAGER)).toBe(true);
  });

  it('denies creative head, employee, and undefined', () => {
    expect(canManageProjectMilestones(ROLES.CREATIVE_HEAD)).toBe(false);
    expect(canManageProjectMilestones(ROLES.EMPLOYEE)).toBe(false);
    expect(canManageProjectMilestones(undefined)).toBe(false);
  });
});
