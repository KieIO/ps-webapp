import type { Role } from '@/config/permissions';
import { ROLES } from '@/config/permissions';
import type { PermissionConfigMap } from '../types';
import { roleHasPermission } from './permissionDerivation';

/** Tracker is available to VIEW_CAPACITY_FULL roles and to employees (scoped projects). */
export const canViewProjectTracker = (
  role: Role | undefined,
  config: PermissionConfigMap | null | undefined,
): boolean => {
  if (!role || !config) return false;
  if (role === ROLES.EMPLOYEE) return true;
  return roleHasPermission(role, 'VIEW_CAPACITY_FULL', config);
};
