import { ROLES, type Role } from '@/config/permissions';

export const canViewCreativeDeadline = (
  role: Role | undefined,
  department?: string | null,
): boolean => {
  if (!role) return false;
  if (role === ROLES.CREATIVE_HEAD || role === ROLES.CREATIVE_MANAGER) return true;
  if (role === ROLES.EMPLOYEE) {
    return department === 'creative_hcm' || department === 'creative_ag';
  }
  return false;
};

export const canEditCreativeDeadline = (role: Role | undefined): boolean =>
  role === ROLES.CREATIVE_HEAD || role === ROLES.CREATIVE_MANAGER;
