import type { Permission } from './permissions';

export type ModuleAccessType = 'universal' | 'permission' | 'planned';

export interface PermissionActionDef {
  permission: Permission;
  label: string;
  description?: string;
}

export interface PermissionModuleDef {
  key: string;
  label: string;
  description?: string;
  accessType: ModuleAccessType;
  actions?: PermissionActionDef[];
  plannedPhase?: 'P1' | 'P2';
}

/**
 * Display registry — groups runtime `PERMISSIONS` keys by product module.
 * Used by the permission matrix and role access preview (not runtime checks).
 *
 * When adding a feature: also update `permissions.ts`, `rbacCoverage.ts`
 * (`MATRIX_PERMISSION_COVERAGE`), sidebar/router. See `.cursorrule` RBAC section.
 */
export const PERMISSION_MODULES: PermissionModuleDef[] = [
  {
    key: 'core',
    label: 'Core',
    description: 'Available to every authenticated user',
    accessType: 'universal',
  },
  {
    key: 'projects',
    label: 'Projects',
    accessType: 'permission',
    actions: [
      { permission: 'MANAGE_PROJECTS', label: 'View project list' },
      { permission: 'EDIT_PROJECT', label: 'Edit project records' },
      { permission: 'ARCHIVE_PROJECT', label: 'Archive / unarchive projects' },
      { permission: 'DELETE_PROJECT', label: 'Delete projects' },
    ],
  },
  {
    key: 'tasks',
    label: 'Tasks',
    accessType: 'permission',
    actions: [
      { permission: 'VIEW_ALL_TASKS', label: 'View all tasks' },
      { permission: 'CREATE_TASK', label: 'Create tasks' },
      { permission: 'ASSIGN_TASK', label: 'Assign tasks' },
      { permission: 'EVALUATE_TASK', label: 'Evaluate staff tasks' },
    ],
  },
  {
    key: 'workload',
    label: 'Workload',
    accessType: 'permission',
    actions: [{ permission: 'VIEW_WORKLOAD', label: 'View team workload' }],
  },
  {
    key: 'quality',
    label: 'Quality Control',
    accessType: 'permission',
    actions: [{ permission: 'VIEW_QUALITY', label: 'View quality metrics' }],
  },
  {
    key: 'creative',
    label: 'Creative Review',
    accessType: 'permission',
    actions: [{ permission: 'REVIEW_CREATIVE_TASK', label: 'Process Creative queue (CH)' }],
  },
  {
    key: 'da-tracking',
    label: 'DA Tracking',
    accessType: 'permission',
    actions: [{ permission: 'REVIEW_CREATIVE_TASK', label: 'Track design assets' }],
  },
  {
    key: 'capacity',
    label: 'Capacity',
    accessType: 'permission',
    actions: [
      { permission: 'VIEW_CAPACITY', label: 'View team capacity (PM)' },
      { permission: 'VIEW_CAPACITY_FULL', label: 'View org capacity & forecast' },
    ],
  },
  {
    key: 'tracker',
    label: 'Project Tracker',
    accessType: 'permission',
    actions: [{ permission: 'VIEW_CAPACITY_FULL', label: 'View project tracker' }],
  },
  {
    key: 'performance',
    label: 'Performance',
    accessType: 'permission',
    actions: [{ permission: 'VIEW_PERFORMANCE', label: 'View performance dashboard' }],
  },
  {
    key: 'kpi',
    label: 'KPI Settings',
    accessType: 'permission',
    actions: [{ permission: 'EDIT_KPI_SETTINGS', label: 'Edit KPI formula & weights' }],
  },
  {
    key: 'overtime',
    label: 'Overtime',
    accessType: 'permission',
    actions: [
      { permission: 'REQUEST_OT', label: 'Request overtime' },
      { permission: 'APPROVE_OT', label: 'Approve overtime' },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    accessType: 'permission',
    actions: [{ permission: 'EXPORT_REPORT', label: 'View & export reports' }],
  },
  {
    key: 'users',
    label: 'Users',
    accessType: 'permission',
    actions: [
      { permission: 'VIEW_USER', label: 'View user profile' },
      { permission: 'MANAGE_USERS', label: 'Manage users' },
      { permission: 'MANAGE_LEAVE', label: 'Schedule employee leave' },
      { permission: 'REACTIVATE_USER', label: 'Reactivate after leave' },
    ],
  },
  {
    key: 'rbac',
    label: 'Roles & Permissions',
    accessType: 'permission',
    actions: [{ permission: 'MANAGE_USERS', label: 'View permission matrix' }],
  },
  {
    key: 'audit',
    label: 'Audit Log',
    accessType: 'permission',
    actions: [{ permission: 'VIEW_AUDIT_LOG', label: 'View audit history' }],
  },
  {
    key: 'titles',
    label: 'Title Management',
    accessType: 'permission',
    actions: [{ permission: 'MANAGE_TITLES', label: 'Manage job titles, levels & groups' }],
  },
  {
    key: 'departments',
    label: 'Department Management',
    accessType: 'permission',
    actions: [{ permission: 'MANAGE_DEPARTMENTS', label: 'Manage departments' }],
  },
  {
    key: 'clients',
    label: 'Client Management',
    accessType: 'permission',
    actions: [{ permission: 'MANAGE_CLIENTS', label: 'Manage clients' }],
  },
  {
    key: 'task-scores',
    label: 'Task types & scores',
    accessType: 'permission',
    actions: [{ permission: 'MANAGE_TASK_SCORES', label: 'Manage task types & scores' }],
  },
  {
    key: 'productivity',
    label: 'Productivity',
    accessType: 'planned',
    plannedPhase: 'P1',
    actions: [{ permission: 'VIEW_PERFORMANCE', label: 'Productivity engine' }],
  },
  {
    key: 'non-project',
    label: 'Non-project Work',
    accessType: 'planned',
    plannedPhase: 'P2',
    actions: [{ permission: 'VIEW_ALL_TASKS', label: 'Log non-project work' }],
  },
];
