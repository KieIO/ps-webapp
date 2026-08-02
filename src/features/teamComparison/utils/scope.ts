import { ROLES, type Role } from '@/config/permissions';
import type { ProductivityRankingRow } from '@/features/productivity/schemas/productivityDashboard.schema';

export type DepartmentScope = 'all' | 'Project' | 'Creative';

/** Default department scope for the viewer's role. */
export function defaultDepartmentScope(role: Role): DepartmentScope {
  if (role === ROLES.CREATIVE_HEAD || role === ROLES.CREATIVE_MANAGER) return 'Creative';
  if (role === ROLES.HEAD || role === ROLES.PM) return 'Project';
  return 'all';
}

/** Whether the viewer can change the department filter (Admin only). */
export function canSelectDepartment(role: Role): boolean {
  return role === ROLES.ADMIN;
}

export function filterRankingByDepartment(
  rows: ProductivityRankingRow[],
  department: DepartmentScope,
): ProductivityRankingRow[] {
  if (department === 'all') return rows;
  return rows.filter((row) => row.displayDepartment === department);
}

/** API query value for ranking department scope. */
export function rankingDepartmentParam(
  department: DepartmentScope,
): 'all' | 'project' | 'creative' {
  if (department === 'Project') return 'project';
  if (department === 'Creative') return 'creative';
  return 'all';
}
