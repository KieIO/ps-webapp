import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';
import type { MyTaskListFilters, TaskCategory } from '../schemas/task.schema';

export const useMyTaskList = (filters: MyTaskListFilters) => {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const role = useAppSelector((state) => state.auth.user?.role);

  return useQuery({
    queryKey: ['tasks', 'my', userId, role, filters],
    queryFn: () => myTaskApi.getList(filters, userId, role),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
};

export const useMyTaskProjectOptions = (taskCategory?: TaskCategory) => {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const role = useAppSelector((state) => state.auth.user?.role);

  return useQuery({
    queryKey: ['tasks', 'my', 'project-options', userId, role, taskCategory],
    queryFn: () => myTaskApi.getProjectOptions({ assigneeUserId: userId, taskCategory, viewerRole: role }),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
};

export const useMyTaskStaffNameOptions = (taskCategory?: TaskCategory) => {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const role = useAppSelector((state) => state.auth.user?.role);

  return useQuery({
    queryKey: ['tasks', 'my', 'staff-name-options', userId, role, taskCategory],
    queryFn: () => myTaskApi.getStaffNameOptions(userId, taskCategory, role),
    enabled: Boolean(userId) && taskCategory === 'project',
    staleTime: 60_000,
  });
};
