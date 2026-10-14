import { ROLES, type Role } from '@/config/permissions';

/** Only Admin and Department Head may create/edit/delete project milestones. */
export const canManageProjectMilestones = (role: Role | undefined): boolean =>
  role === ROLES.ADMIN || role === ROLES.HEAD;
