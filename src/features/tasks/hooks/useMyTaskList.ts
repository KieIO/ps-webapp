import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';
import type { MyTaskListFilters, TaskCategory } from '../schemas/task.schema';

export const useMyTaskList = (filters: MyTaskListFilters) => {
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useQuery({
    queryKey: ['tasks', 'my', userId, filters],
    queryFn: () => myTaskApi.getList(filters, userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
};

export const useMyTaskProjectOptions = (taskCategory?: TaskCategory) => {
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useQuery({
    queryKey: ['tasks', 'my', 'project-options', userId, taskCategory],
    queryFn: () => myTaskApi.getProjectOptions({ assigneeUserId: userId, taskCategory }),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
};

export const useMyTaskStaffNameOptions = (taskCategory?: TaskCategory) => {
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useQuery({
    queryKey: ['tasks', 'my', 'staff-name-options', userId, taskCategory],
    queryFn: () => myTaskApi.getStaffNameOptions(userId, taskCategory),
    enabled: Boolean(userId) && taskCategory === 'project',
    staleTime: 60_000,
  });
};
