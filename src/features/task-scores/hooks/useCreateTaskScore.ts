import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { taskScoreApi } from '../api';
import type { CreateTaskScoreRequest } from '../schemas/taskScore.schema';

export const useCreateTaskScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskScoreRequest) => taskScoreApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-scores'] });
      message.success('Task created');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Failed to create task'));
    },
  });
};
