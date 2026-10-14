import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { canManageProjectMilestones } from './milestoneAuth';

describe('canManageProjectMilestones', () => {
  it('allows admin and department head only', () => {
    expect(canManageProjectMilestones(ROLES.ADMIN)).toBe(true);
    expect(canManageProjectMilestones(ROLES.HEAD)).toBe(true);
    expect(canManageProjectMilestones(ROLES.PM)).toBe(false);
    expect(canManageProjectMilestones(ROLES.CREATIVE_MANAGER)).toBe(false);
    expect(canManageProjectMilestones(ROLES.CREATIVE_HEAD)).toBe(false);
    expect(canManageProjectMilestones(ROLES.EMPLOYEE)).toBe(false);
    expect(canManageProjectMilestones(undefined)).toBe(false);
  });
});
