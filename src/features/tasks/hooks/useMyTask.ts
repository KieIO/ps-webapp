import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';

export const useMyTask = (taskId: string | undefined) => {
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useQuery({
    queryKey: ['tasks', 'my', 'detail', taskId, userId],
    queryFn: () => myTaskApi.getById(taskId!, userId),
    enabled: Boolean(taskId && userId),
    staleTime: 30_000,
  });
};
