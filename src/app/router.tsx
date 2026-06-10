import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { ROLES, type Role } from '@/config/permissions';
import { AuthenticatedLayout } from '@/shared/layout/AuthenticatedLayout';
import { UnauthenticatedLayout } from '@/shared/layout/UnauthenticatedLayout';
import { GlobalLoadingSpinner } from '@/shared/ui/GlobalLoadingSpinner/GlobalLoadingSpinner';
import { useAppSelector } from '@/shared/hooks/useAppSelector';

const LoginPage = lazy(() => import('@/pages/LoginPage/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage/DashboardPage'));
const MyTasksPage = lazy(() => import('@/pages/MyTasksPage/MyTasksPage'));
const NonProjectTasksPage = lazy(() => import('@/pages/NonProjectTasksPage/NonProjectTasksPage'));
const MyTaskDetailPage = lazy(() => import('@/pages/MyTaskDetailPage/MyTaskDetailPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage/NotificationsPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage/ProjectDetailPage'));
const TaskManagePage = lazy(() => import('@/pages/TaskManagePage/TaskManagePage'));
const TaskFormPage = lazy(() => import('@/pages/TaskFormPage/TaskFormPage'));
const WorkloadPage = lazy(() => import('@/pages/WorkloadPage/WorkloadPage'));
const QualityPage = lazy(() => import('@/pages/QualityPage/QualityPage'));
const DATrackingPage = lazy(() => import('@/pages/DATrackingPage/DATrackingPage'));
const CapacityPage = lazy(() => import('@/pages/CapacityPage/CapacityPage'));
const CapacityForecastPage = lazy(() => import('@/pages/CapacityForecastPage/CapacityForecastPage'));
const ProjectTrackerPage = lazy(() => import('@/pages/ProjectTrackerPage/ProjectTrackerPage'));
const PerformancePage = lazy(() => import('@/pages/PerformancePage/PerformancePage'));
const KPISettingsPage = lazy(() => import('@/pages/KPISettingsPage/KPISettingsPage'));
const OvertimePage = lazy(() => import('@/pages/OvertimePage/OvertimePage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage/ReportsPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage/UsersPage'));
const UserDetailPage = lazy(() => import('@/pages/UserDetailPage/UserDetailPage'));
const RolesPage = lazy(() => import('@/pages/RolesPage/RolesPage'));
const AuditLogPage = lazy(() => import('@/pages/AuditLogPage/AuditLogPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage/NotFoundPage'));

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

const router = createBrowserRouter([
  {
    element: <UnauthenticatedLayout />,
    children: [{ path: ROUTES.LOGIN, element: <LoginPage /> }],
  },
  {
    element: <AuthenticatedLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'tasks', element: <Navigate to={ROUTES.PROJECT_TASKS} replace /> },
      { path: ROUTES.PROJECT_TASKS.slice(1), element: <MyTasksPage /> },
      { path: ROUTES.NON_PROJECT_TASKS.slice(1), element: <NonProjectTasksPage /> },
      { path: 'tasks/detail/:id', element: <MyTaskDetailPage /> },
      { path: ROUTES.NOTIFICATIONS.slice(1), element: <NotificationsPage /> },
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
          { path: ROUTES.PROJECTS.slice(1), element: <ProjectsPage /> },
          { path: 'projects/:id', element: <ProjectDetailPage /> },
          { path: 'tasks/manage', element: <TaskManagePage /> },
          { path: 'tasks/new', element: <TaskFormPage /> },
          { path: 'tasks/:id/edit', element: <TaskFormPage /> },
          { path: ROUTES.WORKLOAD.slice(1), element: <WorkloadPage /> },
          { path: ROUTES.QUALITY.slice(1), element: <QualityPage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[ROLES.CREATIVE_HEAD]} />,
        children: [
          { path: 'creative/da', element: <DATrackingPage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[ROLES.HEAD, ROLES.ADMIN]} />,
        children: [
          { path: ROUTES.CAPACITY.slice(1), element: <CapacityPage /> },
          { path: 'capacity/forecast', element: <CapacityForecastPage /> },
          {
            path: ROUTES.PROJECT_TRACKER.slice(1),
            element: <ProjectTrackerPage />,
            handle: { contentLayout: 'flush' },
          },
          { path: 'v2/tracker', element: <Navigate to={ROUTES.PROJECT_TRACKER} replace /> },
          { path: ROUTES.PERFORMANCE.slice(1), element: <PerformancePage /> },
          { path: 'performance/settings', element: <KPISettingsPage /> },
          { path: ROUTES.OVERTIME.slice(1), element: <OvertimePage /> },
          { path: ROUTES.REPORTS.slice(1), element: <ReportsPage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
        children: [
          { path: ROUTES.USERS.slice(1), element: <UsersPage /> },
          { path: 'users/:id', element: <UserDetailPage /> },
          { path: ROUTES.ROLES.slice(1), element: <RolesPage /> },
          { path: ROUTES.AUDIT_LOG.slice(1), element: <AuditLogPage /> },
        ],
      },
    ],
  },
  { path: ROUTES.FORBIDDEN, element: <ForbiddenPage /> },
  { path: ROUTES.NOT_FOUND, element: <NotFoundPage /> },
  { path: '*', element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<GlobalLoadingSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
