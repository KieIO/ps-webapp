import { useQuery } from '@tanstack/react-query';
import { myTaskApi } from '../api';

export const useMyTaskHistory = (taskId: string | undefined) =>
  useQuery({
    queryKey: ['tasks', 'my', 'history', taskId],
    queryFn: () => myTaskApi.getHistory(taskId!),
    enabled: Boolean(taskId),
    staleTime: 30_000,
  });
