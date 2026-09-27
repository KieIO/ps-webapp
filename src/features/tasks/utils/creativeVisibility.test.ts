import { ROLES } from '@/config/permissions';
import { canEditCreativeDeadline, canViewCreativeDeadline } from './creativeVisibility';

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

  it('allows only Admin/PM to edit creative schedule meta', () => {
    expect(canEditCreativeDeadline(ROLES.ADMIN)).toBe(true);
    expect(canEditCreativeDeadline(ROLES.PM)).toBe(true);
    expect(canEditCreativeDeadline(ROLES.CREATIVE_HEAD)).toBe(false);
    expect(canEditCreativeDeadline(ROLES.CREATIVE_MANAGER)).toBe(false);
    expect(canEditCreativeDeadline(ROLES.EMPLOYEE)).toBe(false);
  });
});
