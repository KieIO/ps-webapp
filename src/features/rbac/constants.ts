import { ROLES, type Permission } from '@/config/permissions';

/** localStorage key — see docs/RBAC_BACKEND_TODO.md before changing persistence. */
export const RBAC_STORAGE_KEY = 'pokeslide:rbac-config';

/** Bump when default grants change in a way that must revoke roles (union-merge cannot). */
export const RBAC_STORAGE_VERSION = 2 as const;

export const RBAC_AUDIT_LOG_LIMIT = 50;

/**
 * Grants that cannot be removed (prevents admin lockout).
 * Enforced on save and in the matrix UI.
 */
export const IMMUTABLE_GRANTS: Partial<
  Record<Permission, readonly (typeof ROLES)[keyof typeof ROLES][]>
> = {
  MANAGE_USERS: [ROLES.ADMIN],
  REACTIVATE_USER: [ROLES.ADMIN],
  VIEW_AUDIT_LOG: [ROLES.ADMIN],
};
