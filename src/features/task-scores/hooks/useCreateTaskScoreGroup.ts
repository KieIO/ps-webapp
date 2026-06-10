import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
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
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create group');
    },
  });
};
