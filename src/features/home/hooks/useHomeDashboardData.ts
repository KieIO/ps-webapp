import { useMemo } from 'react';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { useCapacityList } from '@/features/capacity/hooks/useCapacityList';
import { useProjectList } from '@/features/projects/hooks/useProjectList';
import { useMyTaskList } from '@/features/tasks/hooks/useMyTaskList';
import { useUserList } from '@/features/users/hooks/useUserList';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { DEADLINE_RISK_DAYS } from '../constants';
import {
  countTasksByType,
  getTodayCalendarKey,
  isTaskActiveToday,
  listDeadlineRiskProjects,
  listRunningProjectsPreview,
} from '../utils/homeMetrics';
import {
  isHeadHomeDashboardRole,
  scopeCapacityForHome,
  scopeProjectsForHome,
  scopeTasksForHome,
} from '../utils/homeScope';
import { buildTopOverloadItems, buildWorkloadOverviewRows } from '../utils/workloadOverview';

export const useHomeDashboardData = () => {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;
  const todayIso = getTodayCalendarKey();
  const todayLabel = dayjs().format(DATE_FORMAT);
  const enabled = isHeadHomeDashboardRole(role);

  const projectsQuery = useProjectList({ status: 'in_progress' }, { enabled });
  const tasksQuery = useMyTaskList({}, { enabled });
  const capacityQuery = useCapacityList({ mode: 'date', date: todayIso }, { enabled });
  const usersQuery = useUserList({ status: 'active' }, { enabled });

  const derived = useMemo(() => {
    if (!user || !enabled) {
      return null;
    }

    const allProjects = projectsQuery.data?.items ?? [];
    const allTasks = tasksQuery.data?.items ?? [];
    const allCapacity = capacityQuery.data?.items ?? [];
    const allUsers = usersQuery.data?.items ?? [];

    const scopedProjects = scopeProjectsForHome(allProjects, user, {
      tasks: allTasks,
      users: allUsers,
    });
    const scopedTasks = scopeTasksForHome(allTasks, user, scopedProjects);
    const scopedCapacity = scopeCapacityForHome(allCapacity, user);

    const todayTasks = scopedTasks.filter((task) => isTaskActiveToday(task));
    const runningProjectsPreview = listRunningProjectsPreview(scopedProjects);
    const deadlineRiskProjects = listDeadlineRiskProjects(scopedProjects);
    const tasksByType = countTasksByType(todayTasks);
    const workload = buildWorkloadOverviewRows({
      role: user.role,
      users: allUsers,
      scopedProjects,
      scopedTasks,
      capacityItems: scopedCapacity,
    });
    const topOverload = buildTopOverloadItems(scopedCapacity, 5);

    return {
      runningProjectCount: scopedProjects.length,
      runningProjectsPreview,
      deadlineRiskCount: deadlineRiskProjects.length,
      deadlineRiskProjects,
      deadlineRiskDays: DEADLINE_RISK_DAYS,
      todayTaskCount: todayTasks.length,
      todayLabel,
      scopedTaskTotal: scopedTasks.length,
      tasksByType,
      workloadRows: workload.rows,
      workloadPersonColumnLabel: workload.personColumnLabel,
      topOverload,
      /**
       * TODO(home-capacity-dept): Replace with department capacity formula when provided.
       * TODO(home-capacity-company): Replace with company-wide capacity formula when provided.
       */
      departmentCapacityPercent: null as number | null,
      companyCapacityPercent: null as number | null,
    };
  }, [
    user,
    enabled,
    todayLabel,
    projectsQuery.data,
    tasksQuery.data,
    capacityQuery.data,
    usersQuery.data,
  ]);

  const isLoading =
    enabled &&
    (projectsQuery.isLoading ||
      tasksQuery.isLoading ||
      capacityQuery.isLoading ||
      usersQuery.isLoading);

  const isError =
    enabled &&
    (projectsQuery.isError || tasksQuery.isError || capacityQuery.isError || usersQuery.isError);

  return {
    user,
    role,
    isManager: enabled,
    isLoading,
    isError,
    data: derived,
    refetch: () => {
      void projectsQuery.refetch();
      void tasksQuery.refetch();
      void capacityQuery.refetch();
      void usersQuery.refetch();
    },
  };
};
