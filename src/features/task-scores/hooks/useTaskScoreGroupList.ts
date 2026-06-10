import { useQuery } from '@tanstack/react-query';
import { taskScoreApi } from '../api';

export const useTaskScoreGroupList = () =>
  useQuery({
    queryKey: ['task-score-groups'],
    queryFn: () => taskScoreApi.getGroups(),
    staleTime: 30_000,
  });
