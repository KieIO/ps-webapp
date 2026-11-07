import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { taskScoreApi } from '../api';
import type { CreateTaskScoreGroupRequest } from '../schemas/taskScoreGroup.schema';

export const useCreateTaskScoreGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskScoreGroupRequest) => taskScoreApi.createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-score-groups'] });
      message.success('Group created');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Failed to create group'));
    },
  });
};
