import { Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { ROLES, type Role } from '@/config/permissions';
import { canViewProjectTracker } from '@/features/rbac/utils/canViewProjectTracker';
import { AuthenticatedLayout } from '@/shared/layout/AuthenticatedLayout';
import { UnauthenticatedLayout } from '@/shared/layout/UnauthenticatedLayout';
import { GlobalLoadingSpinner } from '@/shared/ui/GlobalLoadingSpinner/GlobalLoadingSpinner';
import { RouteErrorFallback } from '@/shared/ui/RouteErrorFallback/RouteErrorFallback';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { lazyWithRetry } from '@/shared/utils/lazyWithRetry';

const LoginPage = lazyWithRetry(() => import('@/pages/LoginPage/LoginPage'));
const HomePage = lazyWithRetry(() => import('@/pages/HomePage/HomePage'));
const DashboardPage = lazyWithRetry(() => import('@/pages/DashboardPage/DashboardPage'));
const MyTasksPage = lazyWithRetry(() => import('@/pages/MyTasksPage/MyTasksPage'));
const NonProjectTasksPage = lazyWithRetry(
  () => import('@/pages/NonProjectTasksPage/NonProjectTasksPage'),
);
const MyTaskDetailPage = lazyWithRetry(() => import('@/pages/MyTaskDetailPage/MyTaskDetailPage'));
const NotificationsPage = lazyWithRetry(
  () => import('@/pages/NotificationsPage/NotificationsPage'),
);
const ProjectsPage = lazyWithRetry(() => import('@/pages/ProjectsPage/ProjectsPage'));
const ArchivedProjectsPage = lazyWithRetry(
  () => import('@/pages/ArchivedProjectsPage/ArchivedProjectsPage'),
);
const ProjectDetailPage = lazyWithRetry(
  () => import('@/pages/ProjectDetailPage/ProjectDetailPage'),
);
const TaskManagePage = lazyWithRetry(() => import('@/pages/TaskManagePage/TaskManagePage'));
const TaskFormPage = lazyWithRetry(() => import('@/pages/TaskFormPage/TaskFormPage'));
const CreativeReviewPage = lazyWithRetry(
  () => import('@/pages/CreativeReviewPage/CreativeReviewPage'),
);
const DATrackingPage = lazyWithRetry(() => import('@/pages/DATrackingPage/DATrackingPage'));
const CapacityPage = lazyWithRetry(() => import('@/pages/CapacityPage/CapacityPage'));
const CapacityMonthlyPage = lazyWithRetry(
  () => import('@/pages/CapacityMonthlyPage/CapacityMonthlyPage'),
);
const CapacityForecastPage = lazyWithRetry(
  () => import('@/pages/CapacityForecastPage/CapacityForecastPage'),
);
const ProjectTrackerPage = lazyWithRetry(
  () => import('@/pages/ProjectTrackerPage/ProjectTrackerPage'),
);
const ProductivityPage = lazyWithRetry(() => import('@/pages/ProductivityPage/ProductivityPage'));
const TeamComparisonPage = lazyWithRetry(
  () => import('@/pages/TeamComparisonPage/TeamComparisonPage'),
);
const EmployeePerformancePage = lazyWithRetry(
  () => import('@/pages/EmployeePerformancePage/EmployeePerformancePage'),
);
const KPISettingsPage = lazyWithRetry(() => import('@/pages/KPISettingsPage/KPISettingsPage'));
const OvertimePage = lazyWithRetry(() => import('@/pages/OvertimePage/OvertimePage'));
const UsersPage = lazyWithRetry(() => import('@/pages/UsersPage/UsersPage'));
const UserDetailPage = lazyWithRetry(() => import('@/pages/UserDetailPage/UserDetailPage'));
const RolesPage = lazyWithRetry(() => import('@/pages/RolesPage/RolesPage'));
const AuditLogPage = lazyWithRetry(() => import('@/pages/AuditLogPage/AuditLogPage'));
const TitleManagementPage = lazyWithRetry(
  () => import('@/pages/TitleManagementPage/TitleManagementPage'),
);
const DepartmentManagementPage = lazyWithRetry(
  () => import('@/pages/DepartmentManagementPage/DepartmentManagementPage'),
);
const ClientManagementPage = lazyWithRetry(
  () => import('@/pages/ClientManagementPage/ClientManagementPage'),
);
const ClientDetailPage = lazyWithRetry(() => import('@/pages/ClientDetailPage/ClientDetailPage'));
const EmployeeCapacityFormulaPage = lazyWithRetry(
  () => import('@/pages/EmployeeCapacityFormulaPage/EmployeeCapacityFormulaPage'),
);
const TaskScorePage = lazyWithRetry(() => import('@/pages/TaskScorePage/TaskScorePage'));
const GeneralSettingsPage = lazyWithRetry(
  () => import('@/pages/GeneralSettingsPage/GeneralSettingsPage'),
);
const ForbiddenPage = lazyWithRetry(() => import('@/pages/ForbiddenPage/ForbiddenPage'));
const NotFoundPage = lazyWithRetry(() => import('@/pages/NotFoundPage/NotFoundPage'));
interface ProtectedRouteProps {
  allowedRoles: Role[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const role = useAppSelector((state) => state.auth.user?.role);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <Outlet />;
}

/** Landing page — Project Tracker for VIEW_CAPACITY_FULL roles and employees. */
function LandingPage() {
  const role = useAppSelector((state) => state.auth.user?.role);
  const permissionConfig = useAppSelector((state) => state.permissionConfig.config);

  if (canViewProjectTracker(role, permissionConfig)) {
    return <ProjectTrackerPage />;
  }

  return <Navigate to={ROUTES.PROJECT_TASKS} replace />;
}

const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouteErrorFallback />,
    children: [
      {
        element: <UnauthenticatedLayout />,
        children: [{ path: ROUTES.LOGIN, element: <LoginPage /> }],
      },
      {
        element: <AuthenticatedLayout />,
        children: [
          { index: true, element: <LandingPage />, handle: { contentLayout: 'flush' } },
          {
            element: (
              <ProtectedRoute allowedRoles={[ROLES.CREATIVE_HEAD, ROLES.HEAD, ROLES.ADMIN]} />
            ),
            children: [{ path: ROUTES.HOME.slice(1), element: <HomePage /> }],
          },
          { path: ROUTES.DASHBOARD_LEGACY.slice(1), element: <DashboardPage /> },
          {
            path: ROUTES.PROJECT_TRACKER_LEGACY.slice(1),
            element: <Navigate to={ROUTES.PROJECT_TRACKER} replace />,
          },
          {
            path: ROUTES.PROJECT_TRACKER_LEGACY_V2.slice(1),
            element: <Navigate to={ROUTES.PROJECT_TRACKER} replace />,
          },
          { path: 'tasks', element: <Navigate to={ROUTES.PROJECT_TASKS} replace /> },
          { path: ROUTES.PROJECT_TASKS.slice(1), element: <MyTasksPage /> },
          { path: ROUTES.NON_PROJECT_TASKS.slice(1), element: <NonProjectTasksPage /> },
          { path: 'tasks/detail/:id', element: <MyTaskDetailPage /> },
          { path: ROUTES.NOTIFICATIONS.slice(1), element: <NotificationsPage /> },
          {
            element: (
              <ProtectedRoute
                allowedRoles={[
                  ROLES.EMPLOYEE,
                  ROLES.PM,
                  ROLES.CREATIVE_MANAGER,
                  ROLES.CREATIVE_HEAD,
                  ROLES.HEAD,
                  ROLES.ADMIN,
                ]}
              />
            ),
            children: [
              { path: ROUTES.PROJECTS.slice(1), element: <ProjectsPage /> },
              { path: ROUTES.PROJECTS_ARCHIVED.slice(1), element: <ArchivedProjectsPage /> },
              { path: 'projects/:id', element: <ProjectDetailPage /> },
              { path: 'clients/:id', element: <ClientDetailPage /> },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={[
                  ROLES.PM,
                  ROLES.CREATIVE_MANAGER,
                  ROLES.CREATIVE_HEAD,
                  ROLES.HEAD,
                  ROLES.ADMIN,
                ]}
              />
            ),
            children: [
              { path: 'tasks/manage', element: <TaskManagePage /> },
              { path: 'tasks/new', element: <TaskFormPage /> },
              { path: 'tasks/:id/edit', element: <TaskFormPage /> },
              {
                path: ROUTES.WORKLOAD.slice(1),
                element: <Navigate to={ROUTES.NOT_FOUND} replace />,
              },
              {
                path: ROUTES.QUALITY.slice(1),
                element: <Navigate to={ROUTES.NOT_FOUND} replace />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={[ROLES.CREATIVE_HEAD, ROLES.CREATIVE_MANAGER, ROLES.ADMIN, ROLES.PM]}
              />
            ),
            children: [{ path: ROUTES.CREATIVE_REVIEW.slice(1), element: <CreativeReviewPage /> }],
          },
          {
            element: <ProtectedRoute allowedRoles={[ROLES.CREATIVE_HEAD]} />,
            children: [{ path: 'creative/da', element: <DATrackingPage /> }],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={[
                  ROLES.PM,
                  ROLES.CREATIVE_MANAGER,
                  ROLES.HEAD,
                  ROLES.CREATIVE_HEAD,
                  ROLES.ADMIN,
                ]}
              />
            ),
            children: [
              { path: ROUTES.PRODUCTIVITY.slice(1), element: <ProductivityPage /> },
              {
                path: ROUTES.PRODUCTIVITY_LEGACY.slice(1),
                element: <Navigate to={ROUTES.PRODUCTIVITY} replace />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={[
                  ROLES.PM,
                  ROLES.CREATIVE_MANAGER,
                  ROLES.HEAD,
                  ROLES.CREATIVE_HEAD,
                  ROLES.ADMIN,
                ]}
              />
            ),
            children: [
              { path: ROUTES.TEAM_COMPARISON.slice(1), element: <TeamComparisonPage /> },
              {
                path: ROUTES.EMPLOYEE_PERFORMANCE.slice(1),
                element: <EmployeePerformancePage />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute allowedRoles={[ROLES.HEAD, ROLES.CREATIVE_HEAD, ROLES.ADMIN]} />
            ),
            children: [
              { path: ROUTES.SETTINGS_GENERAL.slice(1), element: <GeneralSettingsPage /> },
              { path: ROUTES.ROLES.slice(1), element: <RolesPage /> },
              { path: ROUTES.AUDIT_LOG.slice(1), element: <AuditLogPage /> },
              { path: ROUTES.TITLE_MANAGEMENT.slice(1), element: <TitleManagementPage /> },
              {
                path: ROUTES.DEPARTMENT_MANAGEMENT.slice(1),
                element: <DepartmentManagementPage />,
              },
              {
                path: ROUTES.CLIENT_MANAGEMENT.slice(1),
                element: <ClientManagementPage />,
              },
              {
                path: ROUTES.EMPLOYEE_CAPACITY_FORMULA.slice(1),
                element: <EmployeeCapacityFormulaPage />,
              },
              { path: ROUTES.TASK_SCORE.slice(1), element: <TaskScorePage /> },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={[
                  ROLES.PM,
                  ROLES.CREATIVE_MANAGER,
                  ROLES.CREATIVE_HEAD,
                  ROLES.HEAD,
                  ROLES.ADMIN,
                ]}
              />
            ),
            children: [
              { path: ROUTES.CAPACITY.slice(1), element: <CapacityPage /> },
              { path: 'capacity/monthly', element: <CapacityMonthlyPage /> },
              { path: 'capacity/forecast', element: <CapacityForecastPage /> },
              {
                path: ROUTES.PERFORMANCE.slice(1),
                element: <Navigate to={ROUTES.NOT_FOUND} replace />,
              },
              { path: 'performance/settings', element: <KPISettingsPage /> },
              { path: ROUTES.OVERTIME.slice(1), element: <OvertimePage /> },
              {
                path: ROUTES.REPORTS.slice(1),
                element: <Navigate to={ROUTES.PRODUCTIVITY} replace />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={[
                  ROLES.EMPLOYEE,
                  ROLES.PM,
                  ROLES.CREATIVE_MANAGER,
                  ROLES.CREATIVE_HEAD,
                  ROLES.HEAD,
                  ROLES.ADMIN,
                ]}
              />
            ),
            children: [
              { path: ROUTES.USERS.slice(1), element: <UsersPage /> },
              { path: 'users/:id', element: <UserDetailPage /> },
            ],
          },
        ],
      },
      { path: ROUTES.FORBIDDEN, element: <ForbiddenPage /> },
      { path: ROUTES.NOT_FOUND, element: <NotFoundPage /> },
      { path: '*', element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
    ],
  },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<GlobalLoadingSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
