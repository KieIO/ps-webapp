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

/** PM deadline / urgency — Admin, Head, PM (creator gated at call site when needed). */
export const canEditCreativeScheduleMeta = (role: Role | undefined): boolean =>
  role === ROLES.ADMIN || role === ROLES.HEAD || role === ROLES.PM;

/**
 * Creative deadline: Admin/PM always; CM may set when assigning / editing execution tasks.
 * CH fills initial deadline on handoff via assign-cm, not this helper.
 */
export const canEditCreativeDeadline = (role: Role | undefined): boolean =>
  role === ROLES.ADMIN || role === ROLES.PM || role === ROLES.CREATIVE_MANAGER;

/** Short hint when Deadline Creative is visible but locked for this user. */
export const CREATIVE_DEADLINE_META_EDIT_HINT = 'Chỉ Admin / Head / người tạo task được sửa.';

/**
 * Who may change Deadline Creative on an existing task (generic edit).
 * Admin/Head always; otherwise task creator with a CD-edit role (PM / CM).
 * CM ownership on pipeline tasks is gated separately in CreativeEditDrawer.
 */
export const canEditCreativeDeadlineMeta = (
  role: Role | undefined,
  userId: string | undefined,
  createdById: string | null | undefined,
): boolean => {
  if (!role) return false;
  if (role === ROLES.ADMIN || role === ROLES.HEAD) return true;
  if (!userId || !createdById || userId !== createdById) return false;
  return canEditCreativeDeadline(role);
};
