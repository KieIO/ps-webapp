import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';
import type { CreateQualityReviewRequest } from '../schemas/task.schema';
import { taskQualityReviewsQueryKey } from './useTaskQualityReviews';

interface CreateTaskQualityReviewVariables {
  id: string;
  payload: CreateQualityReviewRequest;
}

export const useCreateTaskQualityReview = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const userName = useAppSelector((state) => state.auth.user?.name);

  return useMutation({
    mutationFn: ({ id, payload }: CreateTaskQualityReviewVariables) =>
      myTaskApi.createQualityReview(id, payload, userId, userName),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskQualityReviewsQueryKey(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['home', 'employee', 'productivity'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my', 'history', variables.id] });
      message.success('Revision recorded');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to save revision');
    },
  });
};
