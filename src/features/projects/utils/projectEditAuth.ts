import { ROLES, type Role } from '@/config/permissions';
import type { Project } from '../schemas/project.schema';

/** Finished / cancelled projects cannot have meta edited. */
export const isProjectMetaEditLockedByStatus = (status: Project['status'] | undefined): boolean =>
  status === 'finish' || status === 'cancel';

/**
 * Project meta edit: Admin (incl. finish/cancel), Head, or creator.
 * Archived stays locked for everyone. Non-admin roles stay locked on finish/cancel.
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
  if (role === ROLES.HEAD) return true;
  if (userId && project.createdById && userId === project.createdById) return true;
  return false;
};
