import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
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
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create task');
    },
  });
};
