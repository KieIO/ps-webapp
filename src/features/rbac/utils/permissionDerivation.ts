import type { Permission, Role } from '@/config/permissions';
import { PERMISSIONS } from '@/config/permissions';
import type { PermissionConfigMap } from '../types';

export type UserPermissionState = Record<keyof typeof PERMISSIONS, boolean>;

export const createEmptyUserPermissions = (): UserPermissionState =>
  Object.keys(PERMISSIONS).reduce((acc, key) => {
    acc[key as Permission] = false;
    return acc;
  }, {} as UserPermissionState);

export const deriveUserPermissions = (
  role: Role,
  config: PermissionConfigMap,
): UserPermissionState => {
  const result = createEmptyUserPermissions();

  (Object.keys(PERMISSIONS) as Permission[]).forEach((permission) => {
    result[permission] = config[permission].includes(role);
  });

  return result;
};

export const roleHasPermission = (
  role: Role,
  permission: Permission,
  config: PermissionConfigMap,
): boolean => config[permission].includes(role);
