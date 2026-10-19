import { ROLES, type Role } from '@/config/permissions';

const MILESTONE_MANAGE_ROLES: ReadonlySet<Role> = new Set([
  ROLES.PM,
  ROLES.CREATIVE_MANAGER,
  ROLES.HEAD,
  ROLES.ADMIN,
]);

/** PM, Creative Manager, Head, and Admin may create/edit/delete/complete project milestones. */
export const canManageProjectMilestones = (role: Role | undefined): boolean =>
  role != null && MILESTONE_MANAGE_ROLES.has(role);
