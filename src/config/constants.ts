export const ROUTES = {
  // Auth
  LOGIN: '/login',

  // All roles
  /** Home route — currently Project Tracker */
  DASHBOARD: '/',
  /** Hidden temporarily — dashboard page kept for later use */
  DASHBOARD_LEGACY: '/dashboard',
  MY_TASKS: '/tasks/project',
  PROJECT_TASKS: '/tasks/project',
  NON_PROJECT_TASKS: '/tasks/non-project',
  MY_TASK_DETAIL: '/tasks/detail/:id',
  /** Reserved — page scaffold exists; not wired in sidebar/router yet */
  TIME_LOG: '/time-log',
  NOTIFICATIONS: '/notifications',

  // PM / Manager
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  TASK_MANAGE: '/tasks/manage',
  TASK_NEW: '/tasks/new',
  TASK_EDIT: '/tasks/:id/edit',
  WORKLOAD: '/workload',
  QUALITY: '/quality',

  // Creative Head
  /** Reserved — page scaffold exists; not wired in sidebar/router yet */
  CREATIVE_REVIEW: '/creative/review',
  DA_TRACKING: '/creative/da',

  // Head / Admin / HR
  CAPACITY: '/capacity',
  CAPACITY_MONTHLY: '/capacity/monthly',
  CAPACITY_FORECAST: '/capacity/forecast',
  PROJECT_TRACKER: '/',
  /** @deprecated Use `PROJECT_TRACKER` — kept for redirects from old bookmarks */
  PROJECT_TRACKER_LEGACY: '/tracker',
  /** @deprecated Use `PROJECT_TRACKER` — kept for redirects from old bookmarks */
  PROJECT_TRACKER_LEGACY_V2: '/v2/tracker',
  PERFORMANCE: '/performance',
  KPI_SETTINGS: '/performance/settings',
  OVERTIME: '/overtime',
  REPORTS: '/reports',

  // Admin / HR
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  ROLES: '/roles',
  AUDIT_LOG: '/audit',
  TITLE_MANAGEMENT: '/settings/titles',
  EMPLOYEE_CAPACITY_FORMULA: '/settings/employee-capacity-formula',
  TASK_SCORE: '/settings/task-score',
  SETTINGS_GENERAL: '/settings/general',

  // System
  FORBIDDEN: '/403',
  NOT_FOUND: '/404',
} as const;

// Dynamic route helpers
export const buildProjectDetailPath = (id: string) => `/projects/${id}`;
export const buildMyTaskDetailPath = (id: string) => `/tasks/detail/${id}`;
export const buildTaskEditPath = (id: string) => `/tasks/${id}/edit`;
export const buildUserDetailPath = (id: string) => `/users/${id}`;

export const APP_NAME = 'Pokeslide Internal Platform';

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const DATE_FORMAT = 'DD/MM/YYYY';
