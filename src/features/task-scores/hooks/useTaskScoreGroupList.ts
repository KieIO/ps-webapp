import { useQuery } from '@tanstack/react-query';
import { taskScoreApi } from '../api';

export const useTaskScoreGroupList = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['task-score-groups'],
    queryFn: () => taskScoreApi.getGroups(),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
