# React JS Project Structure Guide

This document describes the React architecture, conventions, and patterns for the **Pokeslide Internal Platform** — a single unified web application serving all roles (Employee, PM, Head, Admin) with permission-based access control.

---

## 1. Core Philosophy & Overview

### Design Goals

- Long-term maintainability across a growing feature set
- Clear state ownership (server vs client)
- Runtime safety — validate all API responses at boundaries
- Role-based access control without code duplication
- Scalable team collaboration between GoWare and Pokeslide
- Performance-first mindset for daily-use productivity tooling

### Stack

| Concern | Choice | Notes |
|---------|--------|-------|
| **Framework** | React 19 | Pinned in `package.json` |
| **Build tool** | Vite | Fast HMR, optimized production builds |
| **Language** | TypeScript (strict mode) | No `any`; enforce at CI |
| **Router** | React Router v6 (Data Router API) | `createBrowserRouter` only |
| **Server state** | TanStack Query | API data, caching, loading/error states |
| **Client state** | Redux Toolkit | Auth session, role/permission flags, UI toggles |
| **Validation** | Zod | Runtime validation for all API responses |
| **Styling** | CSS Modules + SCSS + CSS variables | Co-located per component |
| **UI Library** | Ant Design v6 | Customized via `ConfigProvider` with Pokeslide theme tokens |
| **Icons** | Ant Design Icons (outlined) | Supplement with Lucide when needed |
| **Animation** | Motion (motion.dev) | Optional; subtle transitions only — see Design Guideline §12 |
| **Testing** | Vitest + React Testing Library | — |
| **Prod server** | Express | JWT middleware, API proxy, SPA catch-all |

### State Management Split

| Concern | Tool | Use for |
|---------|------|---------|
| **Server state** | TanStack Query | All API data: tasks, projects, users, KPIs, capacity |
| **Client state** | Redux Toolkit | Auth session (JWT + decoded user), current role context, sidebar collapse state, global UI flags |
| **Theme / Language** | React Context | Low-frequency updates only |

**Rule**: DO NOT use Redux for API fetching. TanStack Query owns all server state exclusively.

---

## 2. Directory Structure

```
.
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── favicon.ico
│   └── assets/
│       └── logo.svg
│
├── server/                         # Express — JWT middleware, API proxy, SPA routing
│   ├── app.ts
│   └── index.ts
│
├── src/
│   ├── app/                        # App setup & providers
│   │   ├── App.tsx
│   │   ├── router.tsx              # createBrowserRouter — all routes defined here
│   │   └── providers.tsx           # Redux + QueryClient + ConfigProvider + Antd
│   │
│   ├── features/                   # Feature modules — each owns its API, schemas, components
│   │   ├── auth/                   # Login, token handling, logout
│   │   │   ├── api.ts
│   │   │   ├── schemas/
│   │   │   │   └── auth.schema.ts
│   │   │   ├── components/
│   │   │   │   └── LoginForm/
│   │   │   └── hooks/
│   │   │       └── useLogin.ts
│   │   │
│   │   ├── tasks/                  # Task management (Employee + PM view)
│   │   │   ├── api.ts
│   │   │   ├── schemas/
│   │   │   │   └── task.schema.ts
│   │   │   ├── components/
│   │   │   │   ├── TaskTable/
│   │   │   │   ├── TaskForm/
│   │   │   │   └── TaskStatusPill/
│   │   │   ├── hooks/
│   │   │   │   ├── useTaskList.ts
│   │   │   │   └── useTaskMutation.ts
│   │   │   └── utils/
│   │   │       └── taskUtils.ts
│   │   │
│   │   ├── projects/               # Project tracking (PM + Head)
│   │   │   ├── api.ts
│   │   │   ├── schemas/
│   │   │   │   └── project.schema.ts
│   │   │   ├── components/
│   │   │   │   ├── ProjectTable/
│   │   │   │   └── ProjectForm/
│   │   │   └── hooks/
│   │   │       └── useProjectList.ts
│   │   │
│   │   ├── capacity/               # Capacity dashboard (Head)
│   │   │   ├── api.ts
│   │   │   ├── schemas/
│   │   │   │   └── capacity.schema.ts
│   │   │   ├── components/
│   │   │   │   ├── CapacityCalendar/
│   │   │   │   └── CapacityBarChart/
│   │   │   └── hooks/
│   │   │       └── useCapacity.ts
│   │   │
│   │   ├── performance/            # KPI & productivity review (PM + Head)
│   │   │   ├── api.ts
│   │   │   ├── schemas/
│   │   │   │   └── performance.schema.ts
│   │   │   ├── components/
│   │   │   │   ├── ReviewForm/
│   │   │   │   └── KPIScoreCard/
│   │   │   └── hooks/
│   │   │       └── usePerformance.ts
│   │   │
│   │   ├── time-log/               # Work hour logging (Employee) — deferred
│   │   │   ├── api.ts
│   │   │   ├── schemas/
│   │   │   │   └── timeLog.schema.ts
│   │   │   ├── components/
│   │   │   │   ├── TimeLogForm/
│   │   │   │   └── TimeLogTable/
│   │   │   └── hooks/
│   │   │       └── useTimeLog.ts
│   │   │
│   │   ├── reports/                # Reports & data export (Head + Admin)
│   │   │   ├── api.ts
│   │   │   ├── schemas/
│   │   │   │   └── report.schema.ts
│   │   │   ├── components/
│   │   │   │   ├── ReportFilterSection/
│   │   │   │   └── ReportTable/
│   │   │   └── hooks/
│   │   │       └── useReport.ts
│   │   │
│   │   └── users/                  # User management (Admin)
│   │       ├── api.ts
│   │       ├── schemas/
│   │       │   └── user.schema.ts
│   │       ├── components/
│   │       │   ├── UserTable/
│   │       │   └── InviteUserModal/
│   │       └── hooks/
│   │           └── useUserList.ts
│   │
│   ├── pages/                      # Route-level components — thin wrappers only
│   │   ├── LoginPage/
│   │   │   ├── LoginPage.tsx
│   │   │   └── LoginPage.module.scss
│   │   ├── DashboardPage/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── DashboardPage.module.scss
│   │   ├── TasksPage/
│   │   │   ├── TasksPage.tsx
│   │   │   └── TasksPage.module.scss
│   │   ├── TimeLogPage/            # deferred — not in sidebar/router
│   │   │   ├── TimeLogPage.tsx
│   │   │   └── TimeLogPage.module.scss
│   │   ├── ProjectsPage/
│   │   │   ├── ProjectsPage.tsx
│   │   │   └── ProjectsPage.module.scss
│   │   ├── CapacityPage/
│   │   │   ├── CapacityPage.tsx
│   │   │   └── CapacityPage.module.scss
│   │   ├── PerformancePage/
│   │   │   ├── PerformancePage.tsx
│   │   │   └── PerformancePage.module.scss
│   │   ├── ReportsPage/
│   │   │   ├── ReportsPage.tsx
│   │   │   └── ReportsPage.module.scss
│   │   ├── UsersPage/
│   │   │   ├── UsersPage.tsx
│   │   │   └── UsersPage.module.scss
│   │   └── NotFoundPage/
│   │       └── NotFoundPage.tsx
│   │
│   ├── shared/                     # Shared UI & utilities
│   │   ├── ui/                     # Reusable components (Design Guideline §15)
│   │   │   ├── PageHeader/
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   └── PageHeader.module.scss
│   │   │   ├── KPICard/
│   │   │   │   ├── KPICard.tsx
│   │   │   │   └── KPICard.module.scss
│   │   │   ├── CardWrapper/
│   │   │   │   ├── CardWrapper.tsx
│   │   │   │   └── CardWrapper.module.scss
│   │   │   ├── FormFieldWrapper/
│   │   │   │   ├── FormFieldWrapper.tsx
│   │   │   │   └── FormFieldWrapper.module.scss
│   │   │   ├── TableWrapper/
│   │   │   │   ├── TableWrapper.tsx
│   │   │   │   └── TableWrapper.module.scss
│   │   │   ├── FilterSection/
│   │   │   │   ├── FilterSection.tsx
│   │   │   │   └── FilterSection.module.scss
│   │   │   └── StatusPill/
│   │   │       ├── StatusPill.tsx
│   │   │       └── StatusPill.module.scss
│   │   │
│   │   ├── layout/
│   │   │   ├── Layout.tsx               # Root layout shell
│   │   │   ├── AuthenticatedLayout.tsx  # Sidebar + header + Outlet
│   │   │   ├── UnauthenticatedLayout.tsx # Login/standalone screens
│   │   │   └── components/
│   │   │       ├── Sidebar/
│   │   │       │   ├── Sidebar.tsx
│   │   │       │   └── Sidebar.module.scss
│   │   │       └── TopHeader/
│   │   │           ├── TopHeader.tsx
│   │   │           └── TopHeader.module.scss
│   │   │
│   │   ├── api/                    # Base API & axios config
│   │   │   ├── base.api.ts
│   │   │   └── index.ts
│   │   │
│   │   └── hooks/
│   │       ├── useAppDispatch.ts
│   │       ├── useAppSelector.ts
│   │       └── usePermission.ts    # Role-based permission hook
│   │
│   ├── config/
│   │   ├── constants.ts            # ROUTES, APP_NAME, PAGINATION defaults
│   │   ├── routes.ts               # Route path constants
│   │   ├── permissions.ts          # Role → allowed routes/actions map
│   │   └── env.ts                  # VITE_* env variable access
│   │
│   ├── styles/
│   │   ├── index.scss              # Global import entry
│   │   ├── _base.scss              # Reset + html/body base styles
│   │   ├── _variables.scss         # SCSS variables (map to CSS vars)
│   │   ├── _utility.scss           # u-h1, u-title, u-text-muted, etc.
│   │   └── theme.css               # CSS custom properties (design tokens)
│   │
│   ├── store/
│   │   ├── store.ts
│   │   ├── rootReducer.ts
│   │   └── slices/
│   │       ├── authSlice.ts        # JWT token, decoded user, isAuthenticated
│   │       ├── uiSlice.ts          # Sidebar collapsed state, global loading
│   │       └── permissionSlice.ts  # Derived role permissions (set on login)
│   │
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 3. Key Patterns & Conventions

### 3.1 Components

**Page components** (`src/pages/`):
- One folder per page: `PageName/PageName.tsx` + `PageName.module.scss`
- Pages are thin wrappers — no business logic, no direct API calls
- Logic lives in `features/[feature]/components/` or `features/[feature]/hooks/`
- Use `React.lazy()` + `Suspense` for route-based code splitting

**Shared components** (`src/shared/ui/`):
- Reusable across features: `PageHeader`, `KPICard`, `CardWrapper`, `FormFieldWrapper`, `TableWrapper`, `FilterSection`, `StatusPill`
- Use CSS Modules for component-scoped styles
- Must be role-agnostic — conditional rendering by role happens at the page or feature level

**Feature components** (`src/features/[feature]/components/`):
- Self-contained: own components, hooks, API, Zod schemas
- Cross-feature imports are not allowed — go through `shared/` instead
- Each feature folder maps directly to a platform module (tasks, projects, capacity, etc.)

**Role-based rendering**:
- Use `usePermission()` hook (see §3.6) to conditionally render UI per role
- Never hard-code role strings in JSX — use the `ROLES` constant from `config/constants.ts`

### 3.2 File Naming

- **Components**: PascalCase — `TaskTable.tsx`, `StatusPill.tsx`
- **Hooks**: camelCase with `use` prefix — `useTaskList.ts`, `usePermission.ts`
- **Utils**: camelCase — `taskUtils.ts`, `dateUtils.ts`
- **Schemas**: camelCase with `.schema.ts` suffix — `task.schema.ts`
- **Types**: PascalCase or `*.types.ts` — `Task.types.ts`
- **Constants**: SCREAMING_SNAKE_CASE values, camelCase file — `constants.ts`

### 3.3 Barrel Exports

- Use barrels only for the **public API** of a feature (curated, small)
- Prefer **direct imports** for internal use to improve tree-shaking
- Example: `import { TaskTable } from '@/features/tasks/components/TaskTable'`
- NOT: `import { TaskTable } from '@/features/tasks'`

### 3.4 Redux Toolkit — Auth & UI Slices

RTK manages client state only. For Pokeslide, this means three slices:

```
store/slices/
├── authSlice.ts        # JWT token, decoded user object, isAuthenticated flag
├── uiSlice.ts          # Sidebar collapsed, global loading overlay
└── permissionSlice.ts  # Derived from role; set once on login success
```

**Auth slice** (JWT stored in memory — not localStorage for XSS safety; refresh via API):

```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: { id: string; name: string; role: string } | null;
  isAuthenticated: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null, user: null, isAuthenticated: false } as AuthState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; user: AuthState['user'] }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
```

**UI slice** (sidebar, global flags):

```typescript
// store/slices/uiSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarCollapsed: false },
  reducers: {
    toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setSidebarCollapsed: (state, action) => { state.sidebarCollapsed = action.payload; },
  },
});

export const { toggleSidebar, setSidebarCollapsed } = uiSlice.actions;
export default uiSlice.reducer;
```

### 3.5 TanStack Query — Server State

All API data goes through TanStack Query. Never fetch in Redux thunks.

```typescript
// features/tasks/hooks/useTaskList.ts
import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api';

export const useTaskList = (filters: TaskFilters) =>
  useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskApi.getList(filters),
    staleTime: 30_000, // 30s — appropriate for task list in a daily-use app
  });

// Mutation with cache invalidation
export const useSubmitTask = () =>
  useMutation({
    mutationFn: taskApi.submit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
```

**Query key conventions for Pokeslide**:

| Resource | Query key pattern |
|----------|-------------------|
| Task list | `['tasks', { status, assignee, projectId }]` |
| Task detail | `['tasks', taskId]` |
| Project list | `['projects', { status, pmId }]` |
| Capacity | `['capacity', { month, employeeId }]` |
| KPI / Review | `['performance', { period, employeeId }]` |
| Time logs (deferred) | `['time-logs', { date, employeeId }]` |
| Users | `['users', { role, status }]` |

### 3.6 Role-Based Access Control (RBAC)

Pokeslide has 4 roles: `employee`, `pm`, `head`, `admin`.

**Permission config** (`config/permissions.ts`):

```typescript
// config/permissions.ts
export const ROLES = {
  EMPLOYEE: 'employee',
  PM: 'pm',
  HEAD: 'head',
  ADMIN: 'admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  VIEW_CAPACITY:    [ROLES.HEAD, ROLES.ADMIN],
  MANAGE_USERS:     [ROLES.ADMIN],
  REVIEW_TASK:      [ROLES.PM, ROLES.HEAD],
  EXPORT_REPORT:    [ROLES.HEAD, ROLES.ADMIN],
  LOG_TIME:         [ROLES.EMPLOYEE],
  VIEW_ALL_TASKS:   [ROLES.PM, ROLES.HEAD, ROLES.ADMIN],
} as const;
```

**Permission hook** (`shared/hooks/usePermission.ts`):

```typescript
import { useAppSelector } from './useAppSelector';
import { PERMISSIONS } from '@/config/permissions';

export const usePermission = () => {
  const role = useAppSelector((state) => state.auth.user?.role);
  const can = (permission: keyof typeof PERMISSIONS): boolean =>
    role ? PERMISSIONS[permission].includes(role as any) : false;
  return { can, role };
};

// Usage in component:
// const { can } = usePermission();
// {can('EXPORT_REPORT') && <ExportButton />}
```

**Route protection** (`app/router.tsx`):

```typescript
// Wrap protected routes with a guard component
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: Role[] }) => {
  const { role, isAuthenticated } = useAppSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role as Role)) return <Navigate to="/403" replace />;
  return <Outlet />;
};
```

### 3.7 API Layer & Runtime Validation

**Base API** (`shared/api/base.api.ts`):
- Axios instance with `VITE_API_URL` base URL
- Request interceptor: attach JWT token from Redux store
- Response interceptor: handle 401 → dispatch `logout()` + redirect to `/login`
- 403 → redirect to `/403`

```typescript
// shared/api/base.api.ts
import axios from 'axios';
import { store } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Zod validation** — validate every API response:

```typescript
// features/tasks/schemas/task.schema.ts
import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  projectId: z.string(),
  assigneeId: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']),
  dueDate: z.string(), // ISO string — format with dateUtils on display
  hoursEstimated: z.number().nullable(),
  hoursLogged: z.number().nullable(),
});

export type Task = z.infer<typeof TaskSchema>;
export const TaskListSchema = z.array(TaskSchema);
```

```typescript
// features/tasks/api.ts
import api from '@/shared/api/base.api';
import { TaskListSchema, TaskSchema } from './schemas/task.schema';

export const taskApi = {
  getList: async (filters: TaskFilters) => {
    const res = await api.get('/tasks', { params: filters });
    return TaskListSchema.parse(res.data); // throws on shape mismatch
  },
  getById: async (id: string) => {
    const res = await api.get(`/tasks/${id}`);
    return TaskSchema.parse(res.data);
  },
  submit: async (data: CreateTaskPayload) => {
    const res = await api.post('/tasks', data);
    return TaskSchema.parse(res.data);
  },
};
```

### 3.8 Styling

**Theme** (`styles/theme.css`):
Define all Pokeslide design tokens as CSS variables — must match `POKESLIDE_BRAND_AND_STYLE_GUIDELINE.md`:

```css
:root {
  --color-bg:             #F8FAFC;
  --color-surface:        #FFFFFF;
  --color-text:           #0F172A;
  --color-text-body:      #334155;
  --color-text-muted:     #64748B;
  --color-text-disabled:  #94A3B8;
  --color-primary:        #2563EB;
  --color-primary-light:  #3B82F6;
  --color-primary-subtle: #EFF6FF;
  --color-success:        #16A34A;
  --color-warning:        #D97706;
  --color-error:          #DC2626;
  --color-border:         #E2E8F0;
  --color-divider:        #F1F5F9;
}
```

**Ant Design ConfigProvider** (applied in `app/providers.tsx`):

```typescript
const pokeslideTheme = {
  token: {
    colorPrimary:   '#2563EB',
    colorSuccess:   '#16A34A',
    colorWarning:   '#D97706',
    colorError:     '#DC2626',
    colorInfo:      '#0284C7',
    colorBgBase:    '#FFFFFF',
    colorTextBase:  '#0F172A',
    colorBorder:    '#E2E8F0',
    borderRadius:   6,
    fontSize:       14,
    fontFamily:     "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};
```

**Component styles**:
- CSS Modules only: `ComponentName.module.scss` co-located with component
- No Tailwind, no styled-components — do not mix styling systems
- No inline hex values in JSX — always use `var(--color-*)` tokens

### 3.9 Constants & Routes

```typescript
// config/constants.ts
export const APP_NAME = 'Pokeslide Internal Platform';

export const ROUTES = {
  LOGIN:          '/login',
  DASHBOARD:      '/',
  TASKS:          '/tasks',
  // TIME_LOG:    '/time-log',  // deferred — not in sidebar/router
  PROJECTS:       '/projects',
  CAPACITY:       '/capacity',
  PERFORMANCE:    '/performance',
  REPORTS:        '/reports',
  USERS:          '/users',
  FORBIDDEN:      '/403',
  NOT_FOUND:      '/404',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50],
} as const;

export const DATE_FORMAT = 'DD/MM/YYYY'; // used across all date displays
```

---

## 4. App Entry & Routing

### Entry Point (`main.tsx`)

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { AppRouter } from './app/router';
import { store } from './store/store';
import { pokeslideTheme } from './app/providers';
import './styles/index.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={pokeslideTheme}>
        <AppRouter />
      </ConfigProvider>
    </QueryClientProvider>
  </Provider>
);
```

### Router (`app/router.tsx`)

```tsx
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { AuthenticatedLayout } from '@/shared/layout/AuthenticatedLayout';
import { ROUTES } from '@/config/constants';
import { ROLES } from '@/config/permissions';

const DashboardPage   = lazy(() => import('@/pages/DashboardPage/DashboardPage'));
const TasksPage       = lazy(() => import('@/pages/TasksPage/TasksPage'));
// const TimeLogPage  = lazy(() => import('@/pages/TimeLogPage/TimeLogPage')); // deferred
const ProjectsPage    = lazy(() => import('@/pages/ProjectsPage/ProjectsPage'));
const CapacityPage    = lazy(() => import('@/pages/CapacityPage/CapacityPage'));
const PerformancePage = lazy(() => import('@/pages/PerformancePage/PerformancePage'));
const ReportsPage     = lazy(() => import('@/pages/ReportsPage/ReportsPage'));
const UsersPage       = lazy(() => import('@/pages/UsersPage/UsersPage'));
const LoginPage       = lazy(() => import('@/pages/LoginPage/LoginPage'));
const NotFoundPage    = lazy(() => import('@/pages/NotFoundPage/NotFoundPage'));

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    element: <AuthenticatedLayout />,   // sidebar + header shell
    children: [
      { path: ROUTES.DASHBOARD,   element: <DashboardPage /> },
      { path: ROUTES.TASKS,       element: <TasksPage /> },
      // { path: ROUTES.TIME_LOG, element: <TimeLogPage /> }, // deferred
      {
        element: <ProtectedRoute allowedRoles={[ROLES.PM, ROLES.HEAD, ROLES.ADMIN]} />,
        children: [
          { path: ROUTES.PROJECTS,    element: <ProjectsPage /> },
          { path: ROUTES.PERFORMANCE, element: <PerformancePage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[ROLES.HEAD, ROLES.ADMIN]} />,
        children: [
          { path: ROUTES.CAPACITY, element: <CapacityPage /> },
          { path: ROUTES.REPORTS,  element: <ReportsPage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
        children: [
          { path: ROUTES.USERS, element: <UsersPage /> },
        ],
      },
    ],
  },
  { path: ROUTES.NOT_FOUND, element: <NotFoundPage /> },
  { path: '*', element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
]);

export const AppRouter = () => (
  <Suspense fallback={<GlobalLoadingSpinner />}>
    <RouterProvider router={router} />
  </Suspense>
);
```

---

## 5. Global Error Handling

All screens must include:

- **Global Error Boundary** — wraps `<App />`, prevents white screens
- **TanStack Query error fallback** — per-query `error` state rendered in `TableWrapper` and `CardWrapper`
- **Graceful 403 / 404 pages** — not blank screens

```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

---

## 6. Layout System

Three layout variants:

| Variant | Used for | Components |
|---------|----------|------------|
| `AuthenticatedLayout` | All protected pages | `Sidebar` + `TopHeader` + `<Outlet />` |
| `UnauthenticatedLayout` | Login page | Centered card, gradient background |
| `EMPTY` | 403 / 404 / error | No shell |

Sidebar state (collapsed / expanded) is controlled by `uiSlice` in Redux.
The `TopHeader` shows: breadcrumb (left) + notification bell + user avatar (right).

---

## 7. Performance Standards

**Mandatory**:
- Route-level code splitting (`React.lazy` + `Suspense`) — already set up in router
- Bundle analyzer (`rollup-plugin-visualizer`) enabled in `vite.config.ts`
- Memoization (`useMemo`, `useCallback`) only when measured — avoid premature optimization
- TanStack Query `staleTime: 30_000` minimum on list queries to reduce redundant fetches

**For Pokeslide specifically**:
- Capacity calendar and KPI charts are the heaviest components — dynamic import separately
- Table components must support pagination — do not fetch all records at once
- Use `keepPreviousData: true` in TanStack Query for paginated tables to prevent flicker

---

## 8. Code Quality

**Rules**:
- Strict TypeScript in `tsconfig.json` — no `any`, no `@ts-ignore` without justification
- Absolute imports via `@/` — e.g. `@/features/tasks`, `@/shared/ui/StatusPill`
- Typed Redux hooks: `useAppSelector` and `useAppDispatch` (typed wrappers in `shared/hooks/`)
- No inline hex values — use CSS variables only
- No role strings hard-coded in JSX — use `ROLES` and `PERMISSIONS` constants

**Linting**:
- ESLint: `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `@typescript-eslint`
- Custom rule: disallow `role === 'admin'` patterns in JSX (enforce `can()` hook instead)

**Formatting** (Prettier):
- `.prettierrc`: 2 spaces, single quotes, 100 print width
- Applies to `*.{ts,tsx,js,jsx,json,css,scss,md}`

**Git hooks** (Husky + lint-staged):
- `pre-commit`: lint + prettier on staged files

---

## 9. Scripts (`package.json`)

```json
{
  "scripts": {
    "dev":        "vite",
    "build":      "tsc && vite build",
    "preview":    "vite preview",
    "server":     "ts-node server/index.ts",
    "test":       "vitest",
    "test:ui":    "vitest --ui",
    "lint":       "eslint src --ext ts,tsx",
    "lint:fix":   "eslint src --ext ts,tsx --fix",
    "format":     "prettier --write \"src/**/*.{ts,tsx,js,json,scss}\""
  }
}
```

---

## 10. Dependencies Summary

### Core

| Package | Purpose |
|---------|---------|
| react, react-dom | React 19 |
| @reduxjs/toolkit | Client state (auth, UI flags) |
| react-redux | React–Redux bindings |
| @tanstack/react-query | Server state — all API data |
| react-router-dom | React Router v6 Data API |
| axios | HTTP client |
| zod | Runtime API response validation |
| typescript | Type safety (strict mode) |

### UI

| Package | Purpose |
|---------|---------|
| antd | Ant Design v6 (Pokeslide theme via ConfigProvider) |
| @ant-design/icons | Outlined icon set (primary) |
| lucide-react | Supplementary icons when Ant Design lacks coverage |
| classnames | Conditional CSS class names |
| motion | Subtle transitions — enter/exit, layout (motion.dev) |

### Utils

| Package | Purpose |
|---------|---------|
| dayjs | Date formatting — `DD/MM/YYYY` standard across all tables |
| use-debounce | Debounced search inputs in filter sections |
| javascript-time-ago | Relative time ("2 days ago") in task lists |

### Styles

| Package | Purpose |
|---------|---------|
| sass | SCSS support for CSS Modules |

### Dev / Testing

| Package | Purpose |
|---------|---------|
| vitest | Unit & integration tests |
| @testing-library/react | Component testing |
| @testing-library/user-event | User interaction simulation |
| rollup-plugin-visualizer | Bundle size analysis |

---

## 11. Production Server (Express)

Express is required for Pokeslide because:
- JWT token attached to requests needs controlled middleware
- API proxying to backend (avoid CORS issues in production)
- SPA catch-all routing

```typescript
// server/app.ts — simplified; see server/ in repo for full implementation
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import { mountApiProxy } from './middleware/apiProxy.js';

const app = express();
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));
mountApiProxy(app); // /v1/* → API_PROXY_TARGET, forwards Authorization header
app.use(express.static('dist'));
app.get(/^(?!\/v1(?:\/|$)).*/, (_req, res) => res.sendFile('dist/index.html'));
```

**Production env (`.env` or host config):**

```bash
PORT=3000
API_PROXY_TARGET=https://api.pokeslide-internal.com
API_PROXY_PATH=/v1
# Build the SPA with same-origin API:
VITE_API_URL=/v1
```

Run with `npm run build && npm run server` (or `npm start`).

---

## 12. Environment Variables (`.env.example`)

```bash
# API
VITE_API_URL=https://api.pokeslide-internal.com/v1

# App
VITE_APP_NAME=Pokeslide Internal Platform
VITE_APP_VERSION=1.0.0

# Auth
VITE_TOKEN_KEY=pks_access_token   # key name for in-memory token reference (not localStorage)

# Optional
VITE_ENABLE_QUERY_DEVTOOLS=false
```

---

## 13. Production Checklist

Before shipping any feature or release, verify:

- [ ] Strict TypeScript enabled — `tsc` passes with zero errors
- [ ] Zod validation applied to all new API endpoints
- [ ] Role guards applied to all new routes in `router.tsx`
- [ ] `usePermission()` used for all conditional UI — no hard-coded role strings
- [ ] Error boundaries in place — no white screens on API failure
- [ ] TanStack Query retry + staleTime configured for all new queries
- [ ] Bundle size checked with `rollup-plugin-visualizer` after new feature
- [ ] `DATE_FORMAT = 'DD/MM/YYYY'` used consistently — no raw ISO strings in tables
- [ ] Lint + format passing — `pre-commit` hook enforced
- [ ] `.env.example` updated if new `VITE_*` variables added

---

## 14. New Feature Setup Checklist

When adding a new Pokeslide module (e.g. a new report type, a new admin section):

1. Create `src/features/[feature]/` with: `api.ts`, `schemas/`, `components/`, `hooks/`
2. Define Zod schema for all API responses before writing the API function
3. Add a new `src/pages/[Feature]Page/` — thin wrapper only
4. Register route in `app/router.tsx` with appropriate `ProtectedRoute` roles
5. Add route constant to `config/constants.ts → ROUTES`
6. Add permission entry to `config/permissions.ts → PERMISSIONS` if needed
7. Add sidebar menu entry in `shared/layout/components/Sidebar/Sidebar.tsx`
8. Write at least one component test in `features/[feature]/components/`

---

## 15. Architectural Principles

1. **Features are isolated** — no direct cross-feature imports; use `shared/` as the bridge
2. **Pages are thin** — no business logic, no API calls; delegate to feature hooks and components
3. **Roles are data, not code** — use `PERMISSIONS` config + `usePermission()` hook; never `if (role === 'admin')` in JSX
4. **Validate at runtime, not just compile-time** — Zod at every API boundary
5. **Server state belongs to TanStack Query** — no Redux thunks for API calls
6. **Optimize for readability** — a junior dev joining mid-project must understand the code without a walkthrough
7. **Measure before optimizing** — no premature memoization or code splitting beyond route level
8. **Ship stable** — this is a daily-use internal tool; reliability beats feature velocity

---

*Pokeslide Internal Platform — React Project Structure Guide v1.0*
*Prepared by GoWare JSC | June 2026 | Internal use only*
