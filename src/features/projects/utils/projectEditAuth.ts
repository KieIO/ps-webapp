import { ROLES, type Role } from '@/config/permissions';
import type { Project } from '../schemas/project.schema';

/** Finished / cancelled projects cannot have meta edited. */
export const isProjectMetaEditLockedByStatus = (status: Project['status'] | undefined): boolean =>
  status === 'finish' || status === 'cancel';

/**
 * Project meta edit: Admin (incl. finish/cancel), Head, PM (allowlisted fields), or creator.
 * Archived stays locked for everyone. Non-admin roles stay locked on finish/cancel.
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
  if (isProjectMetaEditLockedByStatus(project.status)) return false;
  if (role === ROLES.HEAD || role === ROLES.PM) return true;
  if (userId && project.createdById && userId === project.createdById) return true;
  return false;
};

/**
 * PM Edit Project allowlist (client requirement): endDate, plannedSlides, status,
 * milestones, note — not difficulty (volume/nature/time) or full registry fields.
 * Head/Admin use EDIT_PROJECT for full edit.
 */
export const isPmLimitedProjectFieldEditor = (role: Role | undefined): boolean => role === ROLES.PM;
