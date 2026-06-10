import {
  DashboardOutlined,
  CheckSquareOutlined,
  ProjectOutlined,
  BarChartOutlined,
  TrophyOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ComponentType } from 'react';
import { ROUTES } from './constants';
import type { Permission } from './permissions';

export interface SidebarChildItem {
  label: string;
  path: string;
  permission?: Permission | null;
}

export interface SidebarItem {
  key: string;
  label: string;
  path?: string;
  icon: ComponentType;
  permission: Permission | null;
  children?: readonly SidebarChildItem[];
}

export const SIDEBAR_ITEMS: readonly SidebarItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: DashboardOutlined,
    permission: null,
  },
  {
    key: 'project-tracker',
    label: 'Project Tracker',
    path: ROUTES.PROJECT_TRACKER,
    icon: BarChartOutlined,
    permission: 'VIEW_CAPACITY_FULL',
  },
  {
    key: 'projects',
    label: 'Projects',
    path: ROUTES.PROJECTS,
    icon: ProjectOutlined,
    permission: 'MANAGE_PROJECTS',
  },
  {
    key: 'task-management',
    label: 'Task management',
    icon: CheckSquareOutlined,
    permission: null,
    children: [
      { label: 'Project Tasks', path: ROUTES.PROJECT_TASKS },
      { label: 'Non-project tasks', path: ROUTES.NON_PROJECT_TASKS },
    ],
  },
  {
    key: 'performance',
    label: 'Performance',
    icon: TrophyOutlined,
    permission: null,
    children: [
      { label: 'KPI Dashboard', path: ROUTES.PERFORMANCE, permission: 'VIEW_PERFORMANCE' },
      { label: 'Workload', path: ROUTES.WORKLOAD, permission: 'VIEW_WORKLOAD' },
      { label: 'Quality Control', path: ROUTES.QUALITY, permission: 'VIEW_QUALITY' },
      { label: 'Capacity', path: ROUTES.CAPACITY, permission: 'VIEW_CAPACITY_FULL' },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    path: ROUTES.REPORTS,
    icon: FileTextOutlined,
    permission: 'EXPORT_REPORT',
  },
  {
    key: 'users',
    label: 'Users',
    path: ROUTES.USERS,
    icon: UserOutlined,
    permission: 'MANAGE_USERS',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: SettingOutlined,
    permission: null,
    children: [
      { label: 'Roles & Permissions', path: ROUTES.ROLES, permission: 'MANAGE_USERS' },
      { label: 'Audit Log', path: ROUTES.AUDIT_LOG, permission: 'VIEW_AUDIT_LOG' },
      { label: 'Title management', path: ROUTES.TITLE_MANAGEMENT, permission: 'MANAGE_TITLES' },
      {
        label: 'Capacity formula',
        path: ROUTES.EMPLOYEE_CAPACITY_FORMULA,
        permission: 'MANAGE_TITLES',
      },
      { label: 'Task types & scores', path: ROUTES.TASK_SCORE, permission: 'MANAGE_USERS' },
    ],
  },

  // ── Additional items (permission-filtered) ─────────
  {
    key: 'overtime',
    label: 'Overtime',
    path: ROUTES.OVERTIME,
    icon: FieldTimeOutlined,
    permission: 'APPROVE_OT',
  },
];

/** Prefix for my-task detail pages — nested under task management in the sidebar. */
export const MY_TASK_DETAIL_PATH_PREFIX = '/tasks/detail/';

/** Map task detail URL (+ optional navigation state) to the active sidebar child path. */
export const resolveTaskManagementSelectedPath = (
  pathname: string,
  locationState?: unknown,
): string | undefined => {
  if (!pathname.startsWith(MY_TASK_DETAIL_PATH_PREFIX)) return undefined;

  const from = (locationState as { from?: 'project' | 'non_project' } | null)?.from;
  return from === 'non_project' ? ROUTES.NON_PROJECT_TASKS : ROUTES.PROJECT_TASKS;
};
