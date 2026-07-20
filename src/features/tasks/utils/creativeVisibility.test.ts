import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { canEditCreativeDeadline, canViewCreativeDeadline } from './creativeVisibility';

describe('creativeVisibility', () => {
  it('allows creative roles to view and edit creative deadline', () => {
    expect(canViewCreativeDeadline(ROLES.CREATIVE_HEAD, 'creative_hcm')).toBe(true);
    expect(canViewCreativeDeadline(ROLES.CREATIVE_MANAGER, 'creative_hcm')).toBe(true);
    expect(canEditCreativeDeadline(ROLES.CREATIVE_HEAD)).toBe(true);
    expect(canEditCreativeDeadline(ROLES.CREATIVE_MANAGER)).toBe(true);
  });

  it('allows creative employees to view but not edit creative deadline', () => {
    expect(canViewCreativeDeadline(ROLES.EMPLOYEE, 'creative_hcm')).toBe(true);
    expect(canViewCreativeDeadline(ROLES.EMPLOYEE, 'creative_ag')).toBe(true);
    expect(canEditCreativeDeadline(ROLES.EMPLOYEE)).toBe(false);
  });

  it('hides creative deadline from non-creative users', () => {
    expect(canViewCreativeDeadline(ROLES.PM, 'project')).toBe(false);
    expect(canViewCreativeDeadline(ROLES.EMPLOYEE, 'project')).toBe(false);
  });
});
