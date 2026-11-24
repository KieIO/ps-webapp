import { ROLES, type Role } from '@/config/permissions';
import type { Project } from '../schemas/project.schema';

/** Finished / cancelled — Head (and non-admin/non-PM) cannot edit; Admin/PM still can. */
export const isProjectMetaEditLockedByStatus = (status: Project['status'] | undefined): boolean =>
  status === 'finish' || status === 'cancel';

/**
 * Project meta edit: Admin (incl. finish/cancel), PM (allowlisted fields, incl. reopen
 * finish/cancel), Head on active projects only, or creator on active projects.
 * Archived stays locked for everyone.
 * PM field allowlist: see `isPmLimitedProjectFieldEditor` / EditProjectModal.
 */
export const canEditProjectMeta = (
  project: Pick<Project, 'status' | 'archivedAt' | 'createdById'> | null | undefined,
  role: Role | undefined,
  userId: string | undefined,
): boolean => {
  if (!role || !project) return false;
  if (project.archivedAt) return false;
  if (role === ROLES.ADMIN) return true;
  // PM may still edit finished/cancelled (status + allowlisted fields; reason required on status change).
  if (role === ROLES.PM) return true;
  if (isProjectMetaEditLockedByStatus(project.status)) return false;
  if (role === ROLES.HEAD) return true;
  if (userId && project.createdById && userId === project.createdById) return true;
  return false;
};

/** PM must enter a reason when changing project status (audit). */
export const requiresProjectStatusChangeReason = (
  role: Role | undefined,
  previousStatus: Project['status'] | undefined,
  nextStatus: Project['status'] | undefined,
): boolean => {
  if (role !== ROLES.PM) return false;
  if (!previousStatus || !nextStatus) return false;
  return previousStatus !== nextStatus;
};

/**
 * PM Edit Project allowlist (client requirement): endDate, plannedSlides, status,
 * milestones, note — not difficulty (volume/nature/time) or full registry fields.
 * Head/Admin use EDIT_PROJECT for full edit.
 */
export const isPmLimitedProjectFieldEditor = (role: Role | undefined): boolean => role === ROLES.PM;
