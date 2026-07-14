import { useMemo } from 'react';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { useCapacityList } from '@/features/capacity/hooks/useCapacityList';
import { useProjectList } from '@/features/projects/hooks/useProjectList';
import { useMyTaskList } from '@/features/tasks/hooks/useMyTaskList';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import {
  buildManagerActionTasks,
  buildManagerCompletedTodaySummary,
  buildManagerRunningProjects,
  buildManagerTeamCapacity,
  collectStaffIdsFromTasks,
} from '../utils/managerHomeMetrics';
import { getTodayCalendarKey } from '../utils/homeMetrics';
import { isOpsManagerHomeRole, scopeProjectsForHome, scopeTasksForHome } from '../utils/homeScope';

export const useManagerHomeData = () => {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;
  const todayIso = getTodayCalendarKey();
  const todayLabel = dayjs().format(DATE_FORMAT);
  const enabled = isOpsManagerHomeRole(role);

  const projectsQuery = useProjectList({ status: 'in_progress' }, { enabled });
  const tasksQuery = useMyTaskList({}, { enabled });
  const capacityQuery = useCapacityList({ mode: 'date', date: todayIso }, { enabled });

  const derived = useMemo(() => {
    if (!user || !enabled) return null;

    const allProjects = projectsQuery.data?.items ?? [];
    const allTasks = tasksQuery.data?.items ?? [];
    const allCapacity = capacityQuery.data?.items ?? [];

    const scopedProjects = scopeProjectsForHome(allProjects, user);
    const scopedTasks = scopeTasksForHome(allTasks, user, scopedProjects);
    const staffIds = collectStaffIdsFromTasks(scopedTasks);

    return {
      todayLabel,
      runningProjects: buildManagerRunningProjects(scopedProjects),
      actionTasks: buildManagerActionTasks(scopedTasks, undefined, { excludeUserId: user.id }),
      teamCapacity: buildManagerTeamCapacity(allCapacity, staffIds),
      completedToday: buildManagerCompletedTodaySummary(scopedTasks),
    };
  }, [user, enabled, todayLabel, projectsQuery.data, tasksQuery.data, capacityQuery.data]);

  const isLoading =
    enabled && (projectsQuery.isLoading || tasksQuery.isLoading || capacityQuery.isLoading);

  const isError = enabled && (projectsQuery.isError || tasksQuery.isError || capacityQuery.isError);

  return {
    user,
    role,
    enabled,
    isLoading,
    isError,
    data: derived,
    refetch: () => {
      void projectsQuery.refetch();
      void tasksQuery.refetch();
      void capacityQuery.refetch();
    },
  };
};
