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
export const CREATIVE_DEADLINE_META_EDIT_HINT =
  'Chỉ Admin / Head / PM của task hoặc người tạo được sửa.';

export type CreativeDeadlineMetaContext = {
  createdById?: string | null;
  /** Project PM user id — history "Task created — X" often shows this name, not CreatedByID. */
  projectManagerUserId?: string | null;
};

/**
 * Who may change Deadline Creative on an existing task (generic edit).
 * Admin/Head always; PM of the task or task creator with a CD-edit role.
 * CM ownership on pipeline tasks is gated separately in CreativeEditDrawer.
 *
 * Note: audit history prefers PM name over actor, and legacy backfill used
 * assigned_by_id → created_by_id, so creator-only checks false-negative for PMs.
 */
export const canEditCreativeDeadlineMeta = (
  role: Role | undefined,
  userId: string | undefined,
  context: CreativeDeadlineMetaContext | string | null | undefined,
): boolean => {
  if (!role) return false;
  if (role === ROLES.ADMIN || role === ROLES.HEAD) return true;
  if (!canEditCreativeDeadline(role) || !userId) return false;

  const createdById =
    typeof context === 'string' || context == null ? context : context.createdById;
  const projectManagerUserId =
    typeof context === 'object' && context != null ? context.projectManagerUserId : undefined;

  if (createdById && userId === createdById) return true;
  if (role === ROLES.PM && projectManagerUserId && userId === projectManagerUserId) return true;
  // Legacy rows with no createdById — allow PM (creator unknown after backfill gaps).
  if (role === ROLES.PM && !createdById) return true;
  return false;
};
