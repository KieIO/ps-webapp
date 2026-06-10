import { useQuery } from '@tanstack/react-query';
import { taskScoreApi } from '../api';
import type { TaskScoreListFilters } from '../schemas/taskScore.schema';

export const useTaskScoreList = (filters: TaskScoreListFilters) =>
  useQuery({
    queryKey: ['task-scores', filters],
    queryFn: () => taskScoreApi.getList(filters),
    staleTime: 30_000,
  });
