# Pokeslide Internal Platform — Project Setup Guide

This document describes how to set up and structure the **Pokeslide Internal Platform** repository. It is designed for new team members (GoWare FE developers) who may not have full context on the platform. For core architecture, patterns, and conventions, refer to the companion document: **[POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md](./POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md)**.

---

## 1. Overview

### What is this project?

The Pokeslide Internal Platform is a **single unified web application** used by all Pokeslide staff to manage:

- Project & task workflows across 2 departments (Project Department and Creative Department)
- Workload and capacity tracking in real-time
- Productivity measurement and quality control
- KPI engine and performance reviews
- Non-project work logging and overtime tracking
- Reporting and data export
- User and role management (Admin/HR)

All roles share one codebase. Access and visibility are controlled by **role-based permissions** — not separate apps.

### Who uses this platform?

| Role | Vietnamese label | Primary usage |
|------|-----------------|---------------|
| **Employee / Staff** | Nhân viên | Confirm tasks, log time, view personal dashboard |
| **PM / Manager** | Project Manager | Create & assign tasks, manage projects, track workload |
| **Creative Manager** | Creative Manager (CM) | Assign Creative tasks to Staff, review output |
| **Creative Head** | Creative Head | Evaluate task complexity, assign to CM, approve Creative output |
| **Department Head** | Head | Oversee capacity, approve OT, review KPIs, manage overall performance |
| **Admin / HR** | Admin | Manage users, roles, permissions, audit logs |

### Who is this document for?

- New FE developers joining from GoWare
- Developers picking up a feature module mid-project
- Anyone setting up the project on a new machine

### Stack

React 19 + TypeScript + Vite + Ant Design 6 + TanStack Query + Redux Toolkit + Zod + Express

> Read **[POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md](./POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md)** Sections 1–6 before writing any code.

---

## 2. Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- Git + access to the Pokeslide repository
- A copy of the following companion documents (read in order):
  1. `POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md` — architecture, patterns, conventions
  2. `POKESLIDE_DESIGN_GUIDELINE.md` — UI/UX rules, component density, accessibility
  3. `POKESLIDE_BRAND_AND_STYLE_GUIDELINE.md` — color tokens, typography, Ant Design config

---

## 3. Project Setup

### Step 1: Initialize the project

Follow the **New Project Setup Checklist** in `POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md § 13`:

```bash
# Scaffold
npm create vite@latest . -- --template react-ts

# Core dependencies
npm install @reduxjs/toolkit react-redux @tanstack/react-query react-router-dom axios zod

# UI
npm install antd @ant-design/icons lucide-react classnames motion

# Utils
npm install dayjs use-debounce javascript-time-ago

# Styles
npm install -D sass

# Dev / Testing
npm install -D vitest @testing-library/react @testing-library/user-event rollup-plugin-visualizer

# Git hooks
npm install -D husky lint-staged
```

Then create the folder structure:

```
src/
├── app/          # Router + Providers + App.tsx
├── features/     # Feature modules (one per domain)
├── pages/        # Route-level thin wrappers
├── shared/       # Reusable UI, layout, hooks, base API
├── config/       # ROUTES, PERMISSIONS, SIDEBAR_ITEMS, constants
├── store/        # Redux store + slices
└── styles/       # Global SCSS + CSS variables (design tokens)
```

### Step 2: Configure environment

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env.local
```

`.env.example`:

```bash
# API
VITE_API_URL=https://api.pokeslide-internal.com/v1

# App
VITE_APP_NAME=Pokeslide Internal Platform
VITE_APP_VERSION=1.0.0

# Auth
VITE_TOKEN_KEY=pks_access_token

# Dev tools
VITE_ENABLE_QUERY_DEVTOOLS=false
```

### Step 3: Apply design tokens

Add the Pokeslide CSS variables to `src/styles/theme.css` — copy from `POKESLIDE_BRAND_AND_STYLE_GUIDELINE.md § 2`.

Apply the Ant Design ConfigProvider in `src/app/providers.tsx` — copy from `POKESLIDE_BRAND_AND_STYLE_GUIDELINE.md § 8`.

---

## 4. Pages & Routes

All pages are served from a single app. Route access is controlled by `ProtectedRoute` with role guards.

### 4.1 Unauthenticated

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 1 | **Login** | `/login` | Authentication for all roles |

### 4.2 All authenticated roles

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 2 | **Dashboard** | `/` | Role-aware summary: KPIs, quick actions, capacity snapshot |
| 3 | **My Tasks** | `/tasks` | Personal task list, status, confirm & complete |
| 4 | **Time Log** | `/time-log` | Log hours against tasks (Employee) |
| 5 | **Notifications** | `/notifications` | System alerts: deadline, overload, OT pending, new task |

### 4.3 PM / Creative Manager / Creative Head

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 6 | **Projects** | `/projects` | Project list, status, priority, deadline |
| 7 | **Project Detail** | `/projects/:id` | Timeline, tasks, current PMs, client notes |
| 8 | **Task Management** | `/tasks/manage` | Full task board — assign, track, review all tasks |
| 9 | **Task Form** | `/tasks/new`, `/tasks/:id/edit` | Create / edit task (Project or Creative type) |
| 10 | **Workload** | `/workload` | Per-employee capacity heatmap (free / normal / overloaded) |
| 11 | **Quality Control** | `/quality` | Revision count, QA alerts, quality scores per employee |

### 4.4 Creative Head only

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 12 | **Creative Review** | `/creative/review` | Evaluate task complexity, assign to CM, approve Creative output |
| 13 | **DA Tracking** | `/creative/da` | Tỷ lệ DA được chọn per employee and period |

### 4.5 Department Head / Admin / HR

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 14 | **Capacity Dashboard** | `/capacity` | Overall capacity by day/week — Project + Creative + whole company |
| 15 | **Capacity Forecast** | `/capacity/forecast` | Workload forecast by day/week |
| 16 | **Project Tracker** | `/tracker` | Master tracker: all active projects, status, PMs, progress |
| 17 | **Performance** | `/performance` | KPI dashboard — Target vs Actual, output, quality score per employee |
| 18 | **KPI Settings** | `/performance/settings` | Customize KPI formula and weighting (Head / HR) |
| 19 | **OT Management** | `/overtime` | OT requests list — approve / reject, OT dashboard |
| 20 | **Reports** | `/reports` | Productivity reports, team vs individual comparison, export |

### 4.6 Admin / HR only

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 21 | **Users** | `/users` | User list, search, filter by role/status |
| 22 | **User Detail** | `/users/:id` | View / edit user profile, change role |
| 23 | **Audit Log** | `/audit` | System action history (who did what, when) |

### 4.7 Error / System

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 24 | **Forbidden** | `/403` | Access denied |
| 25 | **Not Found** | `/404` | Page not found |

---

## 5. Route Constants

Define all routes in `src/config/constants.ts`:

```typescript
export const ROUTES = {
  // Auth
  LOGIN: '/login',

  // All roles
  DASHBOARD:      '/',
  MY_TASKS:       '/tasks',
  TIME_LOG:       '/time-log',
  NOTIFICATIONS:  '/notifications',

  // PM / Manager
  PROJECTS:           '/projects',
  PROJECT_DETAIL:     '/projects/:id',
  TASK_MANAGE:        '/tasks/manage',
  TASK_NEW:           '/tasks/new',
  TASK_EDIT:          '/tasks/:id/edit',
  WORKLOAD:           '/workload',
  QUALITY:            '/quality',

  // Creative Head
  CREATIVE_REVIEW:    '/creative/review',
  DA_TRACKING:        '/creative/da',

  // Head / Admin / HR
  CAPACITY:           '/capacity',
  CAPACITY_FORECAST:  '/capacity/forecast',
  PROJECT_TRACKER:    '/tracker',
  PERFORMANCE:        '/performance',
  KPI_SETTINGS:       '/performance/settings',
  OVERTIME:           '/overtime',
  REPORTS:            '/reports',

  // Admin / HR
  USERS:              '/users',
  USER_DETAIL:        '/users/:id',
  AUDIT_LOG:          '/audit',

  // System
  FORBIDDEN:          '/403',
  NOT_FOUND:          '/404',
} as const;

// Dynamic route helpers
export const buildProjectDetailPath  = (id: string) => `/projects/${id}`;
export const buildTaskEditPath       = (id: string) => `/tasks/${id}/edit`;
export const buildUserDetailPath     = (id: string) => `/users/${id}`;
```

---

## 6. Role & Permission Configuration

Pokeslide has **6 roles**. Define them in `src/config/permissions.ts`:

```typescript
export const ROLES = {
  EMPLOYEE:         'employee',
  PM:               'pm',
  CREATIVE_MANAGER: 'creative_manager',
  CREATIVE_HEAD:    'creative_head',
  HEAD:             'head',
  ADMIN:            'admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  // Task & Project
  MANAGE_PROJECTS:      [ROLES.PM, ROLES.CREATIVE_HEAD, ROLES.HEAD, ROLES.ADMIN],
  ASSIGN_TASK:          [ROLES.PM, ROLES.CREATIVE_MANAGER, ROLES.CREATIVE_HEAD],
  REVIEW_CREATIVE_TASK: [ROLES.CREATIVE_HEAD],
  VIEW_ALL_TASKS:       [ROLES.PM, ROLES.CREATIVE_MANAGER, ROLES.CREATIVE_HEAD, ROLES.HEAD, ROLES.ADMIN],

  // Capacity & Workload
  VIEW_CAPACITY:        [ROLES.HEAD, ROLES.ADMIN, ROLES.PM],
  VIEW_CAPACITY_FULL:   [ROLES.HEAD, ROLES.ADMIN],
  VIEW_WORKLOAD:        [ROLES.PM, ROLES.CREATIVE_MANAGER, ROLES.CREATIVE_HEAD, ROLES.HEAD, ROLES.ADMIN],

  // Performance & KPI
  VIEW_PERFORMANCE:     [ROLES.HEAD, ROLES.ADMIN],
  EDIT_KPI_SETTINGS:    [ROLES.HEAD, ROLES.ADMIN],

  // Quality
  VIEW_QUALITY:         [ROLES.PM, ROLES.CREATIVE_HEAD, ROLES.HEAD, ROLES.ADMIN],

  // OT
  REQUEST_OT:           [ROLES.PM, ROLES.CREATIVE_MANAGER],
  APPROVE_OT:           [ROLES.HEAD, ROLES.ADMIN],

  // Reports
  EXPORT_REPORT:        [ROLES.PM, ROLES.HEAD, ROLES.ADMIN],

  // Users & Admin
  MANAGE_USERS:         [ROLES.ADMIN],
  VIEW_AUDIT_LOG:       [ROLES.ADMIN],
} as const;
```

> Use `usePermission()` hook from `shared/hooks/usePermission.ts` — never hard-code role checks in JSX.

---

## 7. Layout & Auth Guard

### Layout variants

| Layout | Use for | Components |
|--------|---------|------------|
| `UnauthenticatedLayout` | `/login` | Centered card, gradient background (`#1E3A5F → #2563EB`) |
| `AuthenticatedLayout` | All protected pages | Sidebar (240px / 64px collapsed) + TopHeader (64px) + `<Outlet />` |
| `EMPTY` | `/403`, `/404` | No shell |

### Auth guard

Wrap protected routes with `ProtectedRoute` in `app/router.tsx`:
- If not authenticated → redirect to `/login`
- If authenticated but role not allowed → redirect to `/403`

### Router structure (conceptual)

```tsx
const router = createBrowserRouter([
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  {
    element: <AuthenticatedLayout />,
    children: [
      // All roles
      { index: true,                   element: <DashboardPage /> },
      { path: ROUTES.MY_TASKS,         element: <MyTasksPage /> },
      { path: ROUTES.TIME_LOG,         element: <TimeLogPage /> },
      { path: ROUTES.NOTIFICATIONS,    element: <NotificationsPage /> },

      // PM + Creative roles + Head + Admin
      {
        element: <ProtectedRoute allowedRoles={[ROLES.PM, ROLES.CREATIVE_MANAGER, ROLES.CREATIVE_HEAD, ROLES.HEAD, ROLES.ADMIN]} />,
        children: [
          { path: ROUTES.PROJECTS,      element: <ProjectsPage /> },
          { path: ROUTES.PROJECT_DETAIL,element: <ProjectDetailPage /> },
          { path: ROUTES.TASK_MANAGE,   element: <TaskManagePage /> },
          { path: ROUTES.TASK_NEW,      element: <TaskFormPage /> },
          { path: ROUTES.TASK_EDIT,     element: <TaskFormPage /> },
          { path: ROUTES.WORKLOAD,      element: <WorkloadPage /> },
          { path: ROUTES.QUALITY,       element: <QualityPage /> },
        ],
      },

      // Creative Head only
      {
        element: <ProtectedRoute allowedRoles={[ROLES.CREATIVE_HEAD]} />,
        children: [
          { path: ROUTES.CREATIVE_REVIEW, element: <CreativeReviewPage /> },
          { path: ROUTES.DA_TRACKING,     element: <DATrackingPage /> },
        ],
      },

      // Head + Admin + HR
      {
        element: <ProtectedRoute allowedRoles={[ROLES.HEAD, ROLES.ADMIN]} />,
        children: [
          { path: ROUTES.CAPACITY,          element: <CapacityPage /> },
          { path: ROUTES.CAPACITY_FORECAST, element: <CapacityForecastPage /> },
          { path: ROUTES.PROJECT_TRACKER,   element: <ProjectTrackerPage /> },
          { path: ROUTES.PERFORMANCE,       element: <PerformancePage /> },
          { path: ROUTES.KPI_SETTINGS,      element: <KPISettingsPage /> },
          { path: ROUTES.OVERTIME,          element: <OvertimePage /> },
          { path: ROUTES.REPORTS,           element: <ReportsPage /> },
        ],
      },

      // Admin only
      {
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
        children: [
          { path: ROUTES.USERS,       element: <UsersPage /> },
          { path: ROUTES.USER_DETAIL, element: <UserDetailPage /> },
          { path: ROUTES.AUDIT_LOG,   element: <AuditLogPage /> },
        ],
      },
    ],
  },
  { path: ROUTES.FORBIDDEN, element: <ForbiddenPage /> },
  { path: ROUTES.NOT_FOUND, element: <NotFoundPage /> },
  { path: '*', element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
]);
```

---

## 8. Sidebar Navigation Config

Define sidebar items in `src/config/sidebar.ts`. Items are filtered at render time by `usePermission()` — do not hard-code role checks inside the Sidebar component.

```typescript
import {
  DashboardOutlined, CheckSquareOutlined, ClockCircleOutlined,
  BellOutlined, ProjectOutlined, TeamOutlined, BarChartOutlined,
  CalendarOutlined, TrophyOutlined, FieldTimeOutlined,
  FileTextOutlined, UserOutlined, AuditOutlined, EyeOutlined,
  FundOutlined,
} from '@ant-design/icons';
import { ROUTES } from './constants';
import { PERMISSIONS } from './permissions';

export const SIDEBAR_ITEMS = [
  // ── All roles ──────────────────────────────────────
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: DashboardOutlined,
    permission: null,                     // visible to all authenticated users
  },
  {
    label: 'My Tasks',
    path: ROUTES.MY_TASKS,
    icon: CheckSquareOutlined,
    permission: null,
  },
  {
    label: 'Time Log',
    path: ROUTES.TIME_LOG,
    icon: ClockCircleOutlined,
    permission: null,
  },
  {
    label: 'Notifications',
    path: ROUTES.NOTIFICATIONS,
    icon: BellOutlined,
    permission: null,
  },

  // ── PM / Manager section ───────────────────────────
  {
    label: 'Projects',
    path: ROUTES.PROJECTS,
    icon: ProjectOutlined,
    permission: 'MANAGE_PROJECTS' as const,
  },
  {
    label: 'Task Management',
    path: ROUTES.TASK_MANAGE,
    icon: TeamOutlined,
    permission: 'VIEW_ALL_TASKS' as const,
  },
  {
    label: 'Workload',
    path: ROUTES.WORKLOAD,
    icon: FundOutlined,
    permission: 'VIEW_WORKLOAD' as const,
  },
  {
    label: 'Quality Control',
    path: ROUTES.QUALITY,
    icon: TrophyOutlined,
    permission: 'VIEW_QUALITY' as const,
  },

  // ── Creative Head section ──────────────────────────
  {
    label: 'Creative Review',
    path: ROUTES.CREATIVE_REVIEW,
    icon: EyeOutlined,
    permission: 'REVIEW_CREATIVE_TASK' as const,
  },

  // ── Head / Admin section ───────────────────────────
  {
    label: 'Capacity',
    path: ROUTES.CAPACITY,
    icon: CalendarOutlined,
    permission: 'VIEW_CAPACITY_FULL' as const,
  },
  {
    label: 'Project Tracker',
    path: ROUTES.PROJECT_TRACKER,
    icon: BarChartOutlined,
    permission: 'VIEW_CAPACITY_FULL' as const,
  },
  {
    label: 'Performance',
    path: ROUTES.PERFORMANCE,
    icon: TrophyOutlined,
    permission: 'VIEW_PERFORMANCE' as const,
  },
  {
    label: 'Overtime',
    path: ROUTES.OVERTIME,
    icon: FieldTimeOutlined,
    permission: 'APPROVE_OT' as const,
  },
  {
    label: 'Reports',
    path: ROUTES.REPORTS,
    icon: FileTextOutlined,
    permission: 'EXPORT_REPORT' as const,
  },

  // ── Admin / HR section ─────────────────────────────
  {
    label: 'Users',
    path: ROUTES.USERS,
    icon: UserOutlined,
    permission: 'MANAGE_USERS' as const,
  },
  {
    label: 'Audit Log',
    path: ROUTES.AUDIT_LOG,
    icon: AuditOutlined,
    permission: 'VIEW_AUDIT_LOG' as const,
  },
] as const;
```

---

## 9. Feature Modules

Each feature module lives in `src/features/[feature]/` and owns: `api.ts`, `schemas/`, `components/`, `hooks/`.

| Feature | Location | Domain | Priority |
|---------|----------|--------|----------|
| **auth** | `features/auth/` | Login, JWT, logout | P0 |
| **tasks** | `features/tasks/` | Task CRUD, confirm, complete — Project & Creative | P0 |
| **projects** | `features/projects/` | Project lifecycle, client notes, handover, deadline | P0 |
| **workload** | `features/workload/` | Capacity heatmap per employee / PM | P0 |
| **capacity** | `features/capacity/` | Overall + forecast dashboard (Head view) | P0 |
| **tracker** | `features/tracker/` | Master project tracker (all active projects) | P0 |
| **quality** | `features/quality/` | Revision count, QA alerts, quality score | P0 |
| **rbac** | `features/rbac/` | Role management, permission matrix, onboarding | P0 |
| **notifications** | `features/notifications/` | System alerts — deadline, overload, OT, new task | P0 |
| **creative** | `features/creative/` | Creative review flow, DA tracking, CM assignment | P0 |
| **productivity** | `features/productivity/` | On-time rate, revision rate, output summary, level | P1 |
| **kpi** | `features/kpi/` | KPI formula, target vs actual, personal dashboard | P1 |
| **reports** | `features/reports/` | Productivity reports, performance review, export | P1 |
| **overtime** | `features/overtime/` | OT request → approval → task → report → dashboard | P2 |
| **non-project** | `features/non-project/` | Log & categorize non-project work, include in KPI | P2 |
| **users** | `features/users/` | User list, detail, onboard, role assignment | P0 |
| **audit** | `features/audit/` | Audit log viewer | P0 |

---

## 10. Page Components Structure

```
src/pages/
├── LoginPage/
│   ├── LoginPage.tsx
│   └── LoginPage.module.scss
│
├── DashboardPage/
│   ├── DashboardPage.tsx          # Role-aware: different KPI cards per role
│   └── DashboardPage.module.scss
│
├── MyTasksPage/
│   ├── MyTasksPage.tsx
│   └── components/
│
├── TimeLogPage/
│   ├── TimeLogPage.tsx
│   └── components/
│
├── ProjectsPage/
│   ├── ProjectsPage.tsx
│   └── components/
│
├── ProjectDetailPage/
│   ├── ProjectDetailPage.tsx      # Timeline, tasks, PMs, client notes
│   └── components/
│
├── TaskManagePage/
│   ├── TaskManagePage.tsx         # Full task board for PM / Head
│   └── components/
│
├── TaskFormPage/
│   ├── TaskFormPage.tsx           # Shared for create & edit (Project + Creative)
│   └── components/
│
├── WorkloadPage/
│   ├── WorkloadPage.tsx           # Per-employee heatmap
│   └── components/
│
├── QualityPage/
│   ├── QualityPage.tsx
│   └── components/
│
├── CreativeReviewPage/
│   ├── CreativeReviewPage.tsx     # Creative Head: evaluate, assign CM
│   └── components/
│
├── DATrackingPage/
│   ├── DATrackingPage.tsx
│   └── components/
│
├── CapacityPage/
│   ├── CapacityPage.tsx           # Overall capacity + breakdown
│   └── components/
│
├── CapacityForecastPage/
│   ├── CapacityForecastPage.tsx
│   └── components/
│
├── ProjectTrackerPage/
│   ├── ProjectTrackerPage.tsx     # Master tracker — all active projects
│   └── components/
│
├── PerformancePage/
│   ├── PerformancePage.tsx        # KPI, Target vs Actual, output, quality
│   └── components/
│
├── KPISettingsPage/
│   ├── KPISettingsPage.tsx        # Customize formula & weights
│   └── components/
│
├── OvertimePage/
│   ├── OvertimePage.tsx           # OT request list + approval + dashboard
│   └── components/
│
├── ReportsPage/
│   ├── ReportsPage.tsx
│   └── components/
│
├── NotificationsPage/
│   ├── NotificationsPage.tsx
│   └── components/
│
├── UsersPage/
│   ├── UsersPage.tsx
│   └── components/
│
├── UserDetailPage/
│   ├── UserDetailPage.tsx
│   └── components/
│
├── AuditLogPage/
│   ├── AuditLogPage.tsx
│   └── components/
│
├── ForbiddenPage/
│   └── ForbiddenPage.tsx
│
└── NotFoundPage/
    └── NotFoundPage.tsx
```

> Pages are **thin wrappers only** — no business logic, no direct API calls. All logic lives in `features/[feature]/hooks/` and `features/[feature]/components/`.

---

## 11. Implementation Order (Recommended)

For the GoWare dev team, suggested order:

### Phase 0 — Foundation (all P0 prerequisites)
1. **Scaffold** — Vite + TS, folder structure, base API, Redux store, router shell
2. **Design tokens** — `theme.css`, Ant Design `ConfigProvider`, shared components (`PageHeader`, `CardWrapper`, `StatusPill`, `TableWrapper`, `FilterSection`)
3. **Layout** — `AuthenticatedLayout`, `UnauthenticatedLayout`, Sidebar, TopHeader
4. **Auth** — Login page, JWT handling, `ProtectedRoute`, role guard, auto-logout on 401

### Phase 1 — Core workflow (P0)
5. **Projects** — Project list, create, status, priority, deadline (internal vs client)
6. **Tasks (Project Department)** — Create task, assign, confirm, complete, manage
7. **Tasks (Creative Department)** — Creative task flow: PM → Creative Head → CM → Staff
8. **Workload** — Per-employee capacity heatmap (PM view)
9. **Capacity Dashboard** — Overall + forecast (Head view)
10. **Project Tracker** — Master tracker all active projects
11. **Quality Control** — Revision count, QA alerts, quality score
12. **RBAC & Users** — User management, role assignment, permission matrix, audit log
13. **Notifications** — System alert feed (deadline, overload, new task, OT pending)

### Phase 2 — Analytics & measurement (P1)
15. **Productivity Engine** — On-time rate, revision rate, DA rate, output summary, employee level
16. **KPI Engine** — Formula config, target vs actual, personal dashboard, salary data
17. **Reports** — Productivity reports, team comparison, performance review, export CSV/Excel
18. **Slack integration** — Task/project notifications via Slack

### Phase 3 — Extended tracking (P2)
19. **Non-Project Work Logging** — Log, categorize non-project tasks, include in KPI
20. **Overtime Tracking** — OT request → Head approval → task assignment → post-OT report → OT dashboard

---

## 12. Quick Reference: Files to Create First

| File | Purpose |
|------|---------|
| `src/config/constants.ts` | `ROUTES`, `DATE_FORMAT`, `PAGINATION`, `APP_NAME` |
| `src/config/permissions.ts` | `ROLES`, `PERMISSIONS` map |
| `src/config/sidebar.ts` | `SIDEBAR_ITEMS` with permission keys |
| `src/styles/theme.css` | CSS design tokens (Pokeslide brand colors) |
| `src/app/providers.tsx` | Ant Design `ConfigProvider` with Pokeslide theme |
| `src/app/router.tsx` | All routes + `ProtectedRoute` guards |
| `src/shared/api/base.api.ts` | Axios instance + JWT interceptor + 401 handler |
| `src/store/slices/authSlice.ts` | JWT token, decoded user, isAuthenticated |
| `src/store/slices/uiSlice.ts` | Sidebar collapsed state |
| `src/shared/hooks/usePermission.ts` | `can(permission)` hook for role-based UI |
| `src/shared/layout/AuthenticatedLayout.tsx` | Sidebar + Header shell |
| `src/shared/layout/UnauthenticatedLayout.tsx` | Login shell (gradient background) |
| `src/shared/ui/StatusPill/StatusPill.tsx` | Task/project status pill (see Design Guideline §9) |
| `src/features/auth/api.ts` | Login API |
| `src/features/auth/schemas/auth.schema.ts` | Zod schema for auth response |
| `src/pages/LoginPage/LoginPage.tsx` | Login page |
| `src/pages/DashboardPage/DashboardPage.tsx` | Dashboard (role-aware) |

---

## 13. Key Business Rules to Know Before Coding

These rules affect component logic and must not be guessed:

| Rule | Details |
|------|---------|
| **Task cannot be assigned on a day off** | If employee is on leave, PM cannot assign task for that day. Future dates are allowed. |
| **Clock-in gate** | If employee has not clocked in = absent. System warns PM; tasks for that day cannot be assigned. |
| **2 task types** | Project task (Project Department) and Creative task (Creative Department). Task type determines the workflow and who handles it. |
| **Creative task flow** | PM → Creative Head (evaluate + assign CM) → Creative Manager (assign Staff) → Staff (confirm + complete) |
| **Task level calculation** | System auto-calculates level from 3 criteria: Design Thinking + Technical + Content Processing (average). |
| **Project level calculation** | System auto-calculates from 3 criteria: Volume + Nature + Time (average). |
| **Internal vs Client deadline** | Always separate. Internal deadline is earlier; client deadline is what's shown externally. |
| **Handover** | PM on leave must handover to another PM. Receiving PM gets full project context. |
| **OT flow** | PM creates OT request → Head approves/rejects → PM assigns OT tasks → Staff reports → PM/CM summarizes → Head reviews |
| **Date format** | Always `DD/MM/YYYY` — across all tables, forms, and exports. Use `dayjs` with this format. |
| **Non-project work** | Counts toward overall KPI contribution — not just project output. |

---

## 14. Checklist for New Developers

**Before writing code:**

- [ ] Read `POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md` Sections 1–6
- [ ] Read `POKESLIDE_DESIGN_GUIDELINE.md` fully
- [ ] Understand the route table (Section 4) and permission map (Section 6)
- [ ] Clone the repo and run `npm install && npm run dev`
- [ ] Copy `.env.example` → `.env.local` and fill in API URL

**When implementing any feature:**

- [ ] Create Zod schema before writing the API function
- [ ] Use TanStack Query for all API calls — no Redux thunks
- [ ] Use `usePermission()` for all role-conditional UI — no `role === 'xxx'` in JSX
- [ ] Add route to `router.tsx` with correct `ProtectedRoute` roles
- [ ] Keep page components thin — logic goes in `features/[feature]/hooks/`
- [ ] Use CSS Modules — no inline hex values, no Tailwind
- [ ] Use `DATE_FORMAT = 'DD/MM/YYYY'` via `dayjs` — no raw ISO strings in tables
- [ ] Add error boundary / empty state to every table and data card
- [ ] Add the feature to the **New Feature Setup Checklist** in `POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md § 14`

---

## 15. Questions?

| Topic | Where to look |
|-------|--------------|
| Architecture & patterns | `POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md` |
| UI rules, spacing, component density | `POKESLIDE_DESIGN_GUIDELINE.md` |
| Colors, tokens, Ant Design config | `POKESLIDE_BRAND_AND_STYLE_GUIDELINE.md` |
| Feature requirements & business rules | `POKESLIDE_PROJECT_MANAGEMENT_SOFTWARE.xlsx` — Sheet: MÔ TẢ TÍNH NĂNG V1 |
| Domain logic & edge cases | Ask PM or Pokeslide product team |
| Layout & wireframes | Figma / design specs (link TBD) |

---

*Pokeslide Internal Platform — Project Setup Guide v1.0*
*Prepared by GoWare JSC | June 2026 | Internal use only*
