import { PERMISSION_MODULES, type PermissionModuleDef } from './permissionModules';
import { PERMISSIONS, type Permission } from './permissions';

const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

/** Permission keys referenced by active (non-planned) matrix rows. */
export const collectActiveMatrixPermissionKeys = (
  modules: readonly PermissionModuleDef[] = PERMISSION_MODULES,
): Permission[] => {
  const keys = new Set<Permission>();

  modules.forEach((module) => {
    if (module.accessType !== 'permission') {
      return;
    }

    module.actions?.forEach((action) => keys.add(action.permission));
  });

  return [...keys].sort();
};

export interface MatrixCoverageReport {
  /** Keys in PERMISSIONS but missing from active matrix modules. */
  uncovered: Permission[];
  /** Keys in matrix modules that are not defined in PERMISSIONS. */
  unknown: string[];
}

export const getMatrixCoverageReport = (
  modules: readonly PermissionModuleDef[] = PERMISSION_MODULES,
): MatrixCoverageReport => {
  const activeKeys = new Set(collectActiveMatrixPermissionKeys(modules));
  const uncovered = ALL_PERMISSIONS.filter((permission) => !activeKeys.has(permission));

  const known = new Set(ALL_PERMISSIONS);
  const unknown = new Set<string>();

  modules.forEach((module) => {
    if (module.accessType === 'universal') {
      return;
    }

    module.actions?.forEach((action) => {
      if (!known.has(action.permission)) {
        unknown.add(action.permission);
      }
    });
  });

  return {
    uncovered,
    unknown: [...unknown].sort(),
  };
};

export const assertRbacMatrixCoverage = (
  modules: readonly PermissionModuleDef[] = PERMISSION_MODULES,
): void => {
  const { uncovered, unknown } = getMatrixCoverageReport(modules);
  const messages: string[] = [];

  if (uncovered.length > 0) {
    messages.push(
      `Permissions missing from permissionModules.ts (accessType: 'permission'): ${uncovered.join(', ')}`,
    );
  }

  if (unknown.length > 0) {
    messages.push(`Unknown permission keys in permissionModules.ts: ${unknown.join(', ')}`);
  }

  if (messages.length > 0) {
    throw new Error(`[RBAC] Matrix coverage check failed.\n${messages.join('\n')}`);
  }
};

/**
 * Compile-time guard: extend this tuple when adding a new Permission.
 * Build fails if any key in PERMISSIONS is not listed here.
 */
export const MATRIX_PERMISSION_COVERAGE = [
  'MANAGE_PROJECTS',
  'EDIT_PROJECT',
  'ASSIGN_TASK',
  'REVIEW_CREATIVE_TASK',
  'VIEW_ALL_TASKS',
  'EVALUATE_TASK',
  'VIEW_CAPACITY',
  'VIEW_CAPACITY_FULL',
  'VIEW_WORKLOAD',
  'VIEW_PERFORMANCE',
  'EDIT_KPI_SETTINGS',
  'VIEW_QUALITY',
  'REQUEST_OT',
  'APPROVE_OT',
  'EXPORT_REPORT',
  'MANAGE_USERS',
  'VIEW_AUDIT_LOG',
] as const satisfies readonly Permission[];

type UncoveredPermission = Exclude<Permission, (typeof MATRIX_PERMISSION_COVERAGE)[number]>;

type AssertMatrixPermissionCoverage = UncoveredPermission extends never
  ? true
  : ['Add permission to MATRIX_PERMISSION_COVERAGE and permissionModules.ts:', UncoveredPermission];

type Assert<T extends true> = T;

/** Fails `tsc` when a PERMISSIONS key is missing from MATRIX_PERMISSION_COVERAGE. */
export type RbacMatrixCoverageOk = Assert<AssertMatrixPermissionCoverage>;
