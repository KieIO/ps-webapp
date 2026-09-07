import { useQuery } from '@tanstack/react-query';
import { myTaskApi } from '../api';

export const taskRevisionsQueryKey = (taskId: string) =>
  ['tasks', 'my', 'revisions', taskId] as const;

export const useTaskRevisions = (taskId: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: taskRevisionsQueryKey(taskId),
    queryFn: () => myTaskApi.listRevisions(taskId),
    enabled: Boolean(taskId) && (options?.enabled ?? true),
    staleTime: 15_000,
  });
