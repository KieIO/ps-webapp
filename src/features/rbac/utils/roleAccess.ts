import { PERMISSION_MODULES } from '@/config/permissionModules';
import { ROLE_ORDER, type Permission, type Role } from '@/config/permissions';
import { getDefaultPermissionConfig } from '../storage/permissionConfig.storage';
import type { PermissionConfigMap } from '../types';
import { roleHasPermission } from './permissionDerivation';

export interface PermissionMatrixRow {
  key: string;
  moduleKey: string;
  moduleLabel: string;
  actionLabel: string;
  permission?: Permission;
  accessType: 'universal' | 'permission' | 'planned';
  plannedPhase?: string;
  grants: Record<Role, boolean>;
  moduleRowSpan: number;
  isFirstInModule: boolean;
}

export interface ModuleAccessEntry {
  moduleKey: string;
  moduleLabel: string;
  actions: string[];
  accessType: 'universal' | 'permission' | 'planned';
  plannedPhase?: string;
}

export interface RoleAccessSummary {
  granted: ModuleAccessEntry[];
  denied: ModuleAccessEntry[];
}

const universalGrants = (): Record<Role, boolean> =>
  Object.fromEntries(ROLE_ORDER.map((role) => [role, true])) as Record<Role, boolean>;

const emptyGrants = (): Record<Role, boolean> =>
  Object.fromEntries(ROLE_ORDER.map((role) => [role, false])) as Record<Role, boolean>;

const grantsForPermission = (
  permission: Permission,
  config: PermissionConfigMap,
): Record<Role, boolean> =>
  Object.fromEntries(
    ROLE_ORDER.map((role) => [role, roleHasPermission(role, permission, config)]),
  ) as Record<Role, boolean>;

export const buildPermissionMatrixRows = (
  config: PermissionConfigMap = getDefaultPermissionConfig(),
): PermissionMatrixRow[] => {
  const rows: PermissionMatrixRow[] = [];

  PERMISSION_MODULES.forEach((module) => {
    if (module.accessType === 'universal') {
      rows.push({
        key: `${module.key}-access`,
        moduleKey: module.key,
        moduleLabel: module.label,
        actionLabel: 'Full access',
        accessType: 'universal',
        grants: universalGrants(),
        moduleRowSpan: 1,
        isFirstInModule: true,
      });
      return;
    }

    const actions = module.actions ?? [];
    actions.forEach((action, index) => {
      rows.push({
        key: `${module.key}-${action.permission}-${index}`,
        moduleKey: module.key,
        moduleLabel: module.label,
        actionLabel: action.label,
        permission: module.accessType === 'permission' ? action.permission : undefined,
        accessType: module.accessType,
        plannedPhase: module.plannedPhase,
        grants:
          module.accessType === 'planned'
            ? emptyGrants()
            : grantsForPermission(action.permission, config),
        moduleRowSpan: index === 0 ? actions.length : 0,
        isFirstInModule: index === 0,
      });
    });
  });

  return rows;
};

const getGrantedActionsForRole = (
  module: (typeof PERMISSION_MODULES)[number],
  role: Role,
  config: PermissionConfigMap,
): string[] => {
  if (module.accessType === 'universal') {
    return ['Full access'];
  }

  if (module.accessType === 'planned') {
    return [];
  }

  return (module.actions ?? [])
    .filter((action) => roleHasPermission(role, action.permission, config))
    .map((action) => action.label);
};

export const getRoleAccessSummary = (
  role: Role,
  config: PermissionConfigMap = getDefaultPermissionConfig(),
): RoleAccessSummary => {
  const granted: ModuleAccessEntry[] = [];
  const denied: ModuleAccessEntry[] = [];

  PERMISSION_MODULES.forEach((module) => {
    const actions = getGrantedActionsForRole(module, role, config);
    const entry: ModuleAccessEntry = {
      moduleKey: module.key,
      moduleLabel: module.label,
      actions,
      accessType: module.accessType,
      plannedPhase: module.plannedPhase,
    };

    if (module.accessType === 'planned') {
      denied.push({ ...entry, actions: [] });
      return;
    }

    if (actions.length > 0) {
      granted.push(entry);
    } else {
      denied.push(entry);
    }
  });

  return { granted, denied };
};
