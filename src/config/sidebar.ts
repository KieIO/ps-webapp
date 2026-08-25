import {
  CheckSquareOutlined,
  FieldTimeOutlined,
  HomeOutlined,
  ProjectOutlined,
  BarChartOutlined,
  TrophyOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ComponentType } from 'react';
import { ROUTES } from './constants';
import { ROLES, type Permission, type Role } from './permissions';
import type { KeyboardShortcut } from '@/shared/utils/keyboardShortcut';

export type SidebarShortcut = KeyboardShortcut;

/** Prefix key for two-step sidebar navigation (e.g. `A` → `P` for Projects). */
export const NAV_SHORTCUT_PREFIX = 'a';

/** `A` then `<key>` — two-step navigation shortcut that avoids browser conflicts. */
export const navShortcut = (key: string): SidebarShortcut => ({
  sequence: [NAV_SHORTCUT_PREFIX, key],
});

export interface SidebarChildItem {
  label: string;
  path: string;
  permission?: Permission | null;
  /** When set, the child is only visible to these roles (in addition to permission). */
  roles?: readonly Role[];
  shortcut?: SidebarShortcut;
}

export interface SidebarItem {
  key: string;
  label: string;
  path?: string;
  icon: ComponentType;
  permission: Permission | null;
  /**
   * When set, the item is visible if the user has ANY of these permissions
   * (takes precedence over `permission`).
   */
  anyOfPermissions?: readonly Permission[];
  shortcut?: SidebarShortcut;
  children?: readonly SidebarChildItem[];
}

/** Settings pages gated by role (no dedicated permission, or MANAGE_USERS is too broad). */
const SETTINGS_HEAD_ROLES = [ROLES.HEAD, ROLES.CREATIVE_HEAD, ROLES.ADMIN] as const;

export const SIDEBAR_ITEMS: readonly SidebarItem[] = [
  {
    key: 'home',
    label: 'Home',
    path: ROUTES.HOME,
    icon: HomeOutlined,
    permission: null,
    shortcut: navShortcut('h'),
  },
  // Hidden temporarily — route kept at ROUTES.DASHBOARD_LEGACY for later use.
  // {
  //   key: 'dashboard',
  //   label: 'Dashboard',
  //   path: ROUTES.DASHBOARD_LEGACY,
  //   icon: DashboardOutlined,
  //   permission: null,
  // },
  {
    key: 'project-tracker',
    label: 'Project Tracker',
    path: ROUTES.PROJECT_TRACKER,
    icon: BarChartOutlined,
    permission: 'VIEW_CAPACITY_FULL',
    shortcut: navShortcut('t'),
  },
  {
    key: 'projects',
    label: 'Projects',
    path: ROUTES.PROJECTS,
    icon: ProjectOutlined,
    permission: 'MANAGE_PROJECTS',
    shortcut: navShortcut('p'),
  },
  {
    key: 'task-management',
    label: 'Task management',
    icon: CheckSquareOutlined,
    permission: null,
    children: [
      { label: 'Project Tasks', path: ROUTES.PROJECT_TASKS, shortcut: navShortcut('k') },
      { label: 'Non-project tasks', path: ROUTES.NON_PROJECT_TASKS, shortcut: navShortcut('n') },
      {
        label: 'Creative queue',
        path: ROUTES.CREATIVE_REVIEW,
        roles: [ROLES.CREATIVE_HEAD, ROLES.CREATIVE_MANAGER, ROLES.ADMIN, ROLES.PM],
        shortcut: navShortcut('g'),
      },
    ],
  },
  {
    key: 'overtime',
    label: 'Overtime',
    path: ROUTES.OVERTIME,
    icon: FieldTimeOutlined,
    permission: null,
    anyOfPermissions: ['REQUEST_OT', 'APPROVE_OT'],
    shortcut: navShortcut('o'),
  },
  {
    key: 'performance',
    label: 'Performance',
    icon: TrophyOutlined,
    permission: null,
    children: [
      // {
      //   label: 'Workload',
      //   path: ROUTES.WORKLOAD,
      //   permission: 'VIEW_WORKLOAD',
      //   shortcut: navShortcut('w'),
      // },
      // {
      //   label: 'Quality Control',
      //   path: ROUTES.QUALITY,
      //   permission: 'VIEW_QUALITY',
      //   shortcut: navShortcut('q'),
      // },
      {
        label: 'Capacity by month',
        path: ROUTES.CAPACITY_MONTHLY,
        permission: 'VIEW_CAPACITY_FULL',
        shortcut: navShortcut('y'),
      },
      {
        label: 'Capacity by employee',
        path: ROUTES.CAPACITY,
        permission: 'VIEW_CAPACITY_FULL',
        shortcut: navShortcut('c'),
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: FileTextOutlined,
    permission: null,
    children: [
      {
        label: 'Productivity',
        path: ROUTES.PRODUCTIVITY,
        permission: 'EXPORT_REPORT',
        shortcut: navShortcut('r'),
      },
      {
        label: 'Team comparison',
        path: ROUTES.TEAM_COMPARISON,
        permission: 'EXPORT_REPORT',
        shortcut: navShortcut('v'),
      },
    ],
  },
  {
    key: 'users',
    label: 'Users',
    path: ROUTES.USERS,
    icon: UserOutlined,
    permission: 'VIEW_USER',
    shortcut: navShortcut('u'),
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: SettingOutlined,
    permission: null,
    children: [
      {
        label: 'General',
        path: ROUTES.SETTINGS_GENERAL,
        permission: null,
        roles: SETTINGS_HEAD_ROLES,
        shortcut: navShortcut('b'),
      },
      {
        label: 'Roles & Permissions',
        path: ROUTES.ROLES,
        permission: null,
        roles: SETTINGS_HEAD_ROLES,
        shortcut: navShortcut('e'),
      },
      {
        label: 'Audit Log',
        path: ROUTES.AUDIT_LOG,
        permission: 'VIEW_AUDIT_LOG',
        shortcut: navShortcut('l'),
      },
      {
        label: 'Title management',
        path: ROUTES.TITLE_MANAGEMENT,
        permission: 'MANAGE_TITLES',
        shortcut: navShortcut('m'),
      },
      {
        label: 'Department management',
        path: ROUTES.DEPARTMENT_MANAGEMENT,
        permission: 'MANAGE_DEPARTMENTS',
        shortcut: navShortcut('d'),
      },
      {
        label: 'Client management',
        path: ROUTES.CLIENT_MANAGEMENT,
        permission: 'MANAGE_CLIENTS',
        shortcut: navShortcut('i'),
      },
      {
        label: 'Capacity formula',
        path: ROUTES.EMPLOYEE_CAPACITY_FORMULA,
        permission: 'MANAGE_TITLES',
        shortcut: navShortcut('f'),
      },
      {
        label: 'Task types & scores',
        path: ROUTES.TASK_SCORE,
        permission: 'MANAGE_TASK_SCORES',
        shortcut: navShortcut('s'),
      },
    ],
  },
];

export function collectSidebarShortcutTargets(
  items: readonly SidebarItem[],
): { path: string; shortcut: SidebarShortcut }[] {
  return items.flatMap((item) => {
    const targets: { path: string; shortcut: SidebarShortcut }[] = [];

    if (item.path && item.shortcut) {
      targets.push({ path: item.path, shortcut: item.shortcut });
    }

    item.children?.forEach((child) => {
      if (child.shortcut) {
        targets.push({ path: child.path, shortcut: child.shortcut });
      }
    });

    return targets;
  });
}

/** Prefix for my-task detail pages — nested under task management in the sidebar. */
export const MY_TASK_DETAIL_PATH_PREFIX = '/tasks/detail/';

/** Pick the most specific sidebar child path for the current URL. */
export const resolveSidebarChildPath = (
  pathname: string,
  children: readonly { path: string }[],
): string | undefined => {
  let best: string | undefined;

  for (const child of children) {
    const matches =
      pathname === child.path || (child.path !== '/' && pathname.startsWith(`${child.path}/`));

    if (!matches) continue;
    if (!best || child.path.length > best.length) {
      best = child.path;
    }
  }

  return best;
};

/** Map task detail URL (+ optional navigation state) to the active sidebar child path. */
export const resolveTaskManagementSelectedPath = (
  pathname: string,
  locationState?: unknown,
): string | undefined => {
  if (!pathname.startsWith(MY_TASK_DETAIL_PATH_PREFIX)) return undefined;

  const from = (locationState as { from?: 'project' | 'non_project' } | null)?.from;
  return from === 'non_project' ? ROUTES.NON_PROJECT_TASKS : ROUTES.PROJECT_TASKS;
};
