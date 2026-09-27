import { ROLES, type Role } from '@/config/permissions';

export const canViewCreativeDeadline = (
  role: Role | undefined,
  department?: string | null,
): boolean => {
  if (!role) return false;
  if (role === ROLES.CREATIVE_HEAD || role === ROLES.CREATIVE_MANAGER) return true;
  if (role === ROLES.ADMIN || role === ROLES.PM) return true;
  if (role === ROLES.EMPLOYEE) {
    return department === 'creative_hcm' || department === 'creative_ag';
  }
  return false;
};

/** PM deadline / creative deadline / urgency — Admin & PM only (not CH/CM). */
export const canEditCreativeScheduleMeta = (role: Role | undefined): boolean =>
  role === ROLES.ADMIN || role === ROLES.PM;

/** @deprecated Prefer canEditCreativeScheduleMeta — same Admin/PM rule. */
export const canEditCreativeDeadline = (role: Role | undefined): boolean =>
  canEditCreativeScheduleMeta(role);
