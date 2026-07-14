import { useQuery } from '@tanstack/react-query';
import { myTaskApi } from '../api';

export const taskQualityReviewsQueryKey = (taskId: string | undefined) =>
  ['tasks', 'my', 'quality-reviews', taskId] as const;

export const useTaskQualityReviews = (taskId: string | undefined) => {
  return useQuery({
    queryKey: taskQualityReviewsQueryKey(taskId),
    queryFn: () => myTaskApi.listQualityReviews(taskId!),
    enabled: Boolean(taskId),
    staleTime: 30_000,
  });
};
