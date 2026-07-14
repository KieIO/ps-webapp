import { useMemo } from 'react';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { useMyTaskList } from '@/features/tasks/hooks/useMyTaskList';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { buildEmployeeEvaluations, buildEmployeeTodayTasks } from '../utils/employeeHomeMetrics';
import { getTodayCalendarKey } from '../utils/homeMetrics';
import { isEmployeeHomeRole } from '../utils/homeScope';
import { useEmployeeProductivity } from './useEmployeeProductivity';

const WEEKDAY_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'] as const;

export const useEmployeeHomeData = () => {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;
  const enabled = isEmployeeHomeRole(role);
  const now = dayjs();
  const todayLabel = now.format(DATE_FORMAT);
  const todayWeekday = WEEKDAY_LABELS[now.day()] ?? '';

  const tasksQuery = useMyTaskList({}, { enabled });
  const productivityQuery = useEmployeeProductivity({ enabled });

  const derived = useMemo(() => {
    if (!enabled || !tasksQuery.data) return null;
    const allTasks = tasksQuery.data.items ?? [];
    const evaluations = buildEmployeeEvaluations(allTasks);
    return {
      todayLabel,
      todayWeekday,
      todayKey: getTodayCalendarKey(),
      todayTasks: buildEmployeeTodayTasks(allTasks),
      evaluations: evaluations.slice(0, 8),
      evaluationTotal: evaluations.length,
    };
  }, [enabled, todayLabel, todayWeekday, tasksQuery.data]);

  // Tasks and productivity load independently so Confirm/Finish is not blocked on metrics.
  const isTasksLoading = enabled && tasksQuery.isLoading;
  const isProductivityLoading = enabled && productivityQuery.isLoading;
  const isTasksError = enabled && tasksQuery.isError;
  const isProductivityError = enabled && productivityQuery.isError;

  return {
    user,
    role,
    enabled,
    isTasksLoading,
    isProductivityLoading,
    isTasksError,
    isProductivityError,
    isError: isTasksError || isProductivityError,
    data: derived,
    productivity: productivityQuery.data ?? null,
    refetch: () => {
      void tasksQuery.refetch();
      void productivityQuery.refetch();
    },
  };
};
