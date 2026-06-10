import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '@/features/tasks/api';

export const useProjectTasks = (projectName: string | undefined) => {
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useQuery({
    queryKey: ['tasks', 'project', userId, projectName],
    queryFn: () =>
      myTaskApi.getList({ taskCategory: 'project', projectName }, userId),
    enabled: Boolean(projectName && userId),
    staleTime: 30_000,
  });
};
