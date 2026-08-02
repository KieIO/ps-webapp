import { ROLES, type Role } from '@/config/permissions';

/** Admin / Department Head / Creative Head — full edit including role & status. */
export const canFullyManageUserProfiles = (role: Role | undefined): boolean =>
  role === ROLES.ADMIN || role === ROLES.HEAD || role === ROLES.CREATIVE_HEAD;

/**
 * Who may edit a given profile:
 * - privileged roles → any user (incl. role/status)
 * - MANAGE_USERS (e.g. PM / Creative Manager) → any user (profile fields only)
 * - everyone else → only their own profile (name/email only)
 */
export const canEditUserProfile = (
  role: Role | undefined,
  actorId: string | undefined,
  targetUserId: string,
  canManageUsers: boolean,
): boolean => {
  if (canFullyManageUserProfiles(role) || canManageUsers) return true;
  return Boolean(actorId && actorId === targetUserId);
};

/** Org fields (department, job title) — managers only; self-edit is name/email. */
export const canEditUserOrgFields = (role: Role | undefined, canManageUsers: boolean): boolean =>
  canFullyManageUserProfiles(role) || canManageUsers;
